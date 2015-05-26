'use strict';
/**
 * @ngdoc controller
 * @name narrator.controller:NarratorCtrl
 * @requires cast.factory:CAST
 * @requires narrator.factory:narratorFactory
 * @description
 * Controls the current state of the narrator; viewing or editing. As well as
 * obtaining the currently selected node and narrative. Also checks if there was
 * a narrative playing (Will be replaced by $state in the future).
 */
angular.module('narrator').controller('NarratorCtrl', [
  '$scope',
  '$state',
  'CAST',
  'narratorFactory',
  function ($scope, $state, CAST, narratorFactory) {

    // Get the current active node in the CAST and its narratives
    $scope.activeNode = CAST.selected || '/';
    $scope.narratives = CAST.getSelectedNarratives() || [];

    
    // If the user is able to edit the narratives or not (boolean)
    $scope.writerMode = narratorFactory.writerMode;
    // Navigate to corresponding state
    if (narratorFactory.writerMode) {
      $state.go('narrating.node.writer');
      $scope.state = 'Viewer';
    } else {
      $state.go('narrating.node.viewer');
      $scope.state = 'Writer';
    }

    // Function to switch between states
    $scope.switchMode = function () {
      if (narratorFactory.writerMode) {
        narratorFactory.writerMode = false;
        $scope.writerMode = narratorFactory.writerMode;
        $scope.state = 'Writer';
        $state.go('narrating.node.viewer');
      } else {
        narratorFactory.writerMode = true;
        $scope.writerMode = narratorFactory.writerMode;
        $scope.state = 'Viewer';
        $state.go('narrating.node.writer');
      }
    };
    
    // If there was a narrative linked, continue that narrative
    if (narratorFactory.narrativeLink) {
      narratorFactory.narrativeLink = false;
      $scope.playing = true;
    } else {
      console.log('test');
      $scope.selected = false;
      $scope.selectedNarrative = {};
      $scope.playing = false;
    }
  }
]);