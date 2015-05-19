'use strict';

/**
 * @ngdoc function
 * @name narrator.factory:narrator
 * @description
 * # narratorFactory
 * Factory of the narrator, containers logic of the state of the narrator.
 */

angular.module('narrator')
  .factory('narratorFactory',['$location', 'CAST', function ($location, CAST) {
    return  {
      // Stores the current mode of the app
      writerMode: true,
      // Tells the view mode if there is a narrative playing
      narrativePlaying: false,
      // Stores the narratives of the current node
      narratives:[],
      // Stores the narratives that are currently playing
      queue: [],
      // Stores state of the narrative thats currently playing
      queueCounter: [],
      // Stores the paths to the queued up nodes
      queuePaths: [],
      // The currently displayed items of the playing narrative
      storyboard: [],
      // True if the there was a narrative linked
      narrativeLink: false,

      selectNarrative: function(narrative){
        this.deselectNarrative();
      	this.narrativePlaying = true;
      	this.pushNarrative(narrative);
      },

      deselectNarrative: function(){
        this.narrativePlaying = false;
        this.queue.length = 0;
        this.queueCounter.length = 0;
        this.storyboard.length = 0;
      },

      pushNarrative: function(narrative){
        this.queue.unshift(narrative);
        this.queueCounter.unshift(0);
        this.storyboard.push({'name':this.queue[0].name, 'items':[]});
      },

      step: function(){
        // If the narrative isnt done playing
        if(this.queue[0].items.length > this.queueCounter[0]){

          var nextItem = this.queue[0].items[this.queueCounter[0]];
          
          // If the next item is a link to another narrative
          if(nextItem instanceof LinkItem){
            this.linkNarrative(nextItem);
          } 
          // Push the next item of the narrative
          else { 
            this.storyboard[this.storyboard.length-1].items.push(nextItem);
            this.queueCounter[0]++;
          }

        }
        // If the narrative is done playing
        else{
          // Remove the first item from the queue
          this.queue.shift();
          this.queueCounter.shift();

          // If there are no more items left in the queue stop playing
          if(this.queue.length == 0)
            this.deselectNarrative();
          // Else continue with the queued up narrative
          else{
            this.storyboard.push({'name':this.queue[0].name, 'items':[]});
            this.narrativeLink = true;
            console.log('go back');
            $location.path(this.queuePaths.shift());
          }
        }        
      },

      linkNarrative: function (nextItem) {
        // Set this value to true to let the controller know a narrative is playing
        this.narrativeLink = true;
        this.queueCounter[0]++;

        // Get the node of the narrative that is linked to and find the narrative
        var node = CAST.getNode(nextItem.content.node);
        var linked;
        for (var index in node.narratives) {
          if (node.narratives[index].name == nextItem.content.id){
            linked = node.narratives[index];
          }
        }

        // Push the narrative on the stack and navigate to the node
        this.pushNarrative(linked);
        this.queuePaths.unshift($location.path());
        $location.path(CAST.project + nextItem.content.node);
      }
    }
  }]);



