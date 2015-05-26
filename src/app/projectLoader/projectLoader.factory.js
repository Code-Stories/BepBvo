'use strict';
/**
 * @ngdoc service
 * @name projectLoader.factory:projectLoaderFactory
 * @description
 *
 * Factory of the projectLoader, contains logic for importing and exporting
 * project files. 
 */

 angular.module('projectLoader').factory('projectLoaderFactory', [
  'CAST',
  function (CAST) {
    return {

      /**
       * @ngdoc method
       * @name loadZip
       * @methodOf projectLoader.factory:projectLoaderFactory
       * @description
       * Loads a project from a zip file  
       *
       * @param {String} data Raw data of the zip file
       */
      loadZip : function (data) {
        var contents = this.UnpackZip( new JSZip(data) );

        CAST.cast.rootnode = contents.cast;
        CAST.appendNarrative(contents.narratives);
      },

      /**
       * @ngdoc method
       * @name packZip
       * @methodOf projectLoader.factory:projectLoaderFactory
       * @description
       * Generates a zip of the current project state and makes it downloadable in the browser.   
       *
       */
      packZip: function(){
        var zip = new JSZip();

        var rootNode = CAST.cast.rootnode;

        //pack cast
        this._packCastZip(rootNode,zip);

        //pack narratives
        var codestories = this._generateCodeStories(CAST.narratives);      
        zip.file('.codestories', JSON.stringify(codestories,null,'  '));

        saveAs(zip.generate({type: 'blob'}), 'project.zip');
      },

      _packCastZip: function(root, zip){
        if(root.children){
          for(var _child in root.children){
            var child = root.children[_child];
            if(child.isFolder()){
              this._packCastZip(child, zip.folder(child.name));
            } else {
              zip.file(child.name, child.content);
            }
          }
        }
      },

      _generateCodeStories: function(narratives){
        var codestories = {};

        for(var path in narratives){
          codestories[path] = [];
          
          var $this = this;
          narratives[path].forEach(function(narrative){
            if(narrative.isFSNarrative()){  //Only supports filesystem narratives now
               codestories[path].push($this._generateFSNarrative(narrative));
            } 
          });
        }

        return codestories;
      },

      _generateFSNarrative: function(fsNarrative){
        var narrative = {};
        narrative.name = fsNarrative.name; 
        narrative.type = 'FS';
        narrative.items = [];

        var $this = this;
        fsNarrative.items.forEach(function(fsItem){
          var item = $this._generateItem(fsItem);
          narrative.items.push(item);
        }); 

        return narrative;
      },

      _generateItem: function(itemObj){
        var item = {};
        item.type = itemObj.type;
        item.content = itemObj.content;
        return item;
      },

      UnpackZip : function (zip) {
        var ret = {
          cast: undefined,
          narratives: undefined
        };

        var root = new FolderNode('', null, {});
        root.path = '';

        var $this = this;
        //Loop through files that are packed in the zip
        Object.getOwnPropertyNames(zip.files).forEach(function (element) {
          var isDirectory = element.slice(-1) === '/';
          var isJS = false;
          var isCodestoriesFile = false;

          var path = element.split('/');


          if (isDirectory){
            path.pop();     //avoid empty string at end of path
          }

          var last = path.pop();

          if(!isDirectory){
             var fileExtension = last.split('.').pop();
            if (fileExtension === 'js') {
              isJS = true;
            } else if(fileExtension === 'codestories'){
              isCodestoriesFile = true;
            }
          }

          var newRoot = $this._walkTo(root, path);
          
          if (!newRoot.children[last]) {
            if(isCodestoriesFile){   //Parse the narratives file
              ret.narratives = JSON.parse(zip.file(element).asText());
            } else if (isDirectory) {  //Create the new directory
              newRoot.children[last] = new FolderNode(last, root, {});
            } else {   //Create the new file
              newRoot.children[last] = new FileNode(last, root, {}, zip.file(element).asText());
            }
          }
        });
        ret.cast = root;

        return ret;
      },

      _walkTo: function(root, path){
        var higherRoot = root;

        path.forEach(function (element) {
          if (higherRoot.children[element]) {       //If the folder is already defined, step into it
            higherRoot = higherRoot.children[element];
          } else {                                  //Otherwise, create the folder node. 
            higherRoot.children[element] = new FolderNode(element, higherRoot, {});  
            higherRoot = higherRoot.children[element];
          }
        });

        return higherRoot;
      }

    };
  }
]);