'use strict';

/**
 * @ngdoc function
 * @name narrator.controller:NarratorCtrl
 * @description
 * # NarratorCtrl
 * Controller of the narrator
 */

angular.module('narrator')
  .controller('NarratorCtrl', [ '$scope', '$stateParams', '$state', 'CAST', 'narratorFactory', 
  	function ($scope, $stateParams, $state, CAST, narratorFactory) {

 	// Get the current active node in the CAST
 	if($stateParams.path)
    $scope.activeNode = CAST.getNode($stateParams.path);
  else
   	$scope.activeNode = CAST.getNode('/');

  // Get the narratives of the current node
  $scope.narratives = narratorFactory.narratives = $scope.activeNode.narratives;

  // If the user is able to edit the narratives or not (boolean)
 	$scope.writerMode = narratorFactory.writerMode;

 	// Navigate to corresponding state
  if(narratorFactory.writerMode) {
  	$state.go('narrating.writer');
  	$scope.state = "Viewer";
  }
  else {
  	$state.go('narrating.viewer');
  	$scope.state = "Writer";
  }

  // Function to switch between states
  $scope.switchMode = function(){
  	if(narratorFactory.writerMode){
  		narratorFactory.writerMode = false;
  		$scope.writerMode = narratorFactory.writerMode;
  		$scope.state="Writer";
	  	$state.go('narrating.viewer');
  	}
	  else{
	  	narratorFactory.writerMode = true;
  		$scope.writerMode = narratorFactory.writerMode;
  		$scope.state="Viewer"
	  	$state.go('narrating.writer');
	  }
  }

  // Tells the writer the selected narrative
  $scope.selected = false;
  $scope.selectedNarrative = {};

  // Select a narrative to edit or view
  $scope.selectNarrative = function(narrative){
    $scope.selected = true;
    $scope.selectedNarrative = narrative;
    narratorFactory.selectNarrative(narrative);
  };

  // Deselect the narrative being edited or viewed
  $scope.deselectNarrative = function(){
    $scope.selected = false;
    narratorFactory.deselectNarrative();
  }

}]);
