'use strict';

/**
 * @ngdoc service
 * @name narrator.factory:viewerFactory
 * @requires cast.factory:CAST
 * @requires narrator.factory:interpreterFactory
 * @description
 *
 * Factory of the viewer, containers logic of the viewer like selecting, deselecting
 * and stepping through a narrative.
 */
 
 angular.module('narrator')
 .factory('viewerFactory',['$state', '$stateParams', 'CAST','interpreterFactory', 'vCodeInterpreterFactory' ,
  function ($state, $stateParams, CAST, interpreterFactory, vCodeInterpreterFactory) {
  return {

       /**
       * @ngdoc property
       * @name storyboard
       * @propertyOf narrator.factory:viewerFactory
       * @description
       * Array that contains she currently displayed items of the playing narrative
       */
      storyboard: [], 
      // Stores the narratives that are currently playing
      queue: [],
      // Stores state of the narrative thats currently playing
      queueCounter: [],
      // Stores the paths to the queued up nodes
      queuePaths: [],
      // The current node of a code narrative. (Will be replaced by $state in the future.)
      lastCodeNarrativeNode: "",
      // Scope of the code that is playing at this current moment.
      interpreterScope : {},

      /**
       * @ngdoc method
       * @name selectNarrative
       * @methodOf narrator.factory:viewerFactory
       * @description
       * First deselects a narrative if any narrative is still playing. Then sets the
       * current state to playing and pushes the given narrative on the queue.
       *
       * @param {object} narrative a narrative object to play.
       */     
      selectNarrative: function(narrative){
        this.deselectNarrative();
        this.pushNarrative(narrative);
        $state.go('narrating.viewing.playing');
      },

      /**
       * @ngdoc method
       * @name deselectNarrative
       * @methodOf narrator.factory:viewerFactory
       * @description
       * Deselects the current playing narrative. This empties the queue and sets
       * the playing state to false.
       */ 
      deselectNarrative: function(){
        this.queue.length = 0;
        this.queueCounter.length = 0;
        this.storyboard.length = 0;
        $state.go('narrating.viewing.selecting');
      },

      /**
        * @ngdoc method
        * @name pushNarrative
        * @methodOf narrator.factory:viewerFactory
        * @description
        * Pushes a new narrative to the front of queue, and on the storyboard. This 
        * narrative will now be played until a new narrative is pushed.
        * @param {object} narrative a narrative object to push on the stack.
        */
      pushNarrative: function(narrative){
        this.queue.unshift(narrative);
        this.queueCounter.unshift(0);
        this.storyboard.push({'name':this.queue[0].name, 'items':[]});
        if( narrative.isCodeNarrative() ){
          var CASTNode = CAST.getNode(narrative.CASTPath);
          interpreterFactory.reset();
          interpreterFactory.setupNarratedAST(CASTNode,narrative);
          vCodeInterpreterFactory.startSession();
        }
      },

      /**
        * @ngdoc method
        * @name popNarrative
        * @methodOf narrator.factory:viewerFactory
        * @description
        * Pops a narrative from the queue. When there are still narratives on the queue
        * play the next narrative. If the queue is empty then stop playing.
        */
      popNarrative: function() {
        // Remove the first item from the queue
        this.queue.shift();
        this.queueCounter.shift();

        // If there are no more items left in the queue stop playing
        if(this.queue.length == 0){
          this.deselectNarrative();
        }
        // Else continue with the queued up narrative
        else{
          this.storyboard.push({'name':this.queue[0].name, 'items':[]});
          $state.go('narrating.viewing.playing', {'path': this.queuePaths.shift()});
        }
      },

      /**
        * @ngdoc method
        * @name step
        * @methodOf narrator.factory:viewerFactory
        * @description
        * Determines which narrative step should be taken depending on the narrative that is
        * playing. Pops a narrative when the next step is the last of the narrative.
        */
      step: function(){
        var result;
        if( this.queue[0].isCodeNarrative() ){
            result = this.codeNarrativeStep();
        } else {
            result = this.fsNarrativeStep();
        }
        if(!result){
           this.popNarrative();
        }
      },


      /**
        * @ngdoc method
        * @name fsNarrativeStep
        * @methodOf narrator.factory:viewerFactory
        * @description
        * Performs a narrative step for a file or folder narrative.
        * Adds an item to the storyboard if available.
        * Links to another narrative if an item is a link. If there is no more item
        * then it pops the narrative of the queue and continues with the next narrative
        * or halts playback.
        */
      fsNarrativeStep: function(){
        if(this.queue[0].items.length > this.queueCounter[0]){
            var nextItem = this.queue[0].items[this.queueCounter[0]];
        } else {
          return false;
        }

        this.queueCounter[0]++;
        if( nextItem.isLinkItem() ) {
          this.loadNarrative(nextItem);
        }
        else { 
          this.storyboard[this.storyboard.length-1].items.push(nextItem);
        }
        return true;
      },

      /**
        * @ngdoc method
        * @name codeNarrativeStep
        * @methodOf narrator.factory:viewerFactory
        * @description
        * 
        */
      codeNarrativeStep: function(step) {
        var codeStep = step || interpreterFactory.narrativeStep();
        var item = codeStep.item;
        if(!item) return false;

        if(item.isVCodeItem()){
          item = item.clone();
          vCodeInterpreterFactory.runVCode( item , codeStep.scope);
        }

        // Match text from a text time to be replaced by values of the current state of execution
        var doubleBrakRegex = /\[\[\s?(\w*)\s?\]\]/ // regex to match [[ someword ]]
        if(item.isTextItem()){
          var matched = doubleBrakRegex.exec(item.content);
          while( matched ){
            var value = codeStep.scope[matched[1]];
            item.content = item.content.split(matched[0]).join(value);
            matched = doubleBrakRegex.exec(item.content);
          }
        }

        // Push the narrative on the storyboard
        this.interpreterScope = codeStep.scope
        this.storyboard[this.storyboard.length-1].items.push(item);

        // Goes to next node
        if(this.lastCodeNarrativeNode != codeStep.node.getPath()){
          this.lastCodeNarrativeNode = codeStep.node.getPath();
          $state.go('narrating.viewing.playing', {'path': codeStep.node.getPath()});
        }
        this.lastCodeNarrativeNode = codeStep.node.getPath();
        return true;
      },
      
      /**
        * @ngdoc method
        * @name loadNarrative
        * @methodOf narrator.factory:viewerFactory
        * @description
        * Load the next narrative that is specified in a link item.
        */
      loadNarrative: function (linkItem) {
        // Get the node of the narrative that is linked to and find the narrative
        var node = CAST.getNode(linkItem.content.path);
        var narratives = CAST.getNarratives(linkItem.content.path);
        var linked;

        for (var index in narratives) {
          if (narratives[index].name == linkItem.content.id){
            linked = narratives[index];
          }
        }

        if(linked === undefined){
          linked = node.isASTNode() ? 
          new CodeNarrative('A new narrative appears',linkItem.content.path ) : new FSNarrative('A new narrative appears',linkItem.content.path);
        } 
        this.queuePaths.unshift($stateParams.path);

        // Push the narrative on the stack and navigate to the node
        this.pushNarrative(linked);

        $state.go('narrating.viewing.playing', {'path': linkItem.content.path});
      },

      /**
        * @ngdoc method
        * @name debugStep
        * @methodOf narrator.factory:viewerFactory
        * @description
        * Steps through code rather than narrative. If the next item is also an item in a narrative then
        * play back that item.
        */
      debugStep: function(){
        var step = interpreterFactory.debugStep();
        
        if(step.item){
          this.codeNarrativeStep(step);
        } else {
          this.interpreterScope = step.scope;
          $state.go('narrating.viewing.playing', {'path': step.node.getPath()});
        }
      },
    }
  }]);



