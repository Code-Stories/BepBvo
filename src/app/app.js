'use strict';

/**
 * @ngdoc overview
 * @name codeStoriesApp
 * @description
 * # codeStoriesApp
 *
 * Main module of the application.
 */
angular
  .module('codeStoriesApp', [
    'ngAnimate',
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'ui.router',
    'projectLoader',
    'cast',
    'narrator',
    'explorer'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider',
    function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
    

    (function() {
      function valToString(val) { return val !== null ? val.toString() : val; }//.replace("%252F", "").toString()
      function valFromString(val) { return val !== null ? val.toString(): val; }//.replace("%2F", "").toString()
      function regexpMatches(val) { /*jshint validthis:true */ return this.pattern.test(val); }
      $urlMatcherFactoryProvider.type('string', {
        encode: valFromString,
        decode: valFromString,
        is: regexpMatches,
        pattern: /[^/]*/
      });
    })();


    var resolveCASTObj = {
      resolveCAST : ['$stateParams', '$http', 'CAST', 'projectLoaderFactory', 
        function($stateParams, $http, CAST, projectLoaderFactory){

          var setPath = function () {
            if (CAST.selectedPath !== $stateParams.path) {
              CAST.setSelected($stateParams.path);

              if(CAST.selected.isASTNode()){
                var parent = CAST.selected.getParent();
                while (!parent.content){
                  parent = parent.getParent();
                }
                CAST.content = parent.content;
              } else if(CAST.selected.isFile()){
                CAST.content = CAST.selected.content;
              } else {
                CAST.content = "This is a folder";
              }
            }
          }

          if (CAST.project !== $stateParams.project) {
            if ($stateParams.project.endsWith('.zip')) {
              return $http({
                url: '/stories/' + $stateParams.project,
                method: 'GET',
                responseType: 'arraybuffer'
              }).success(function (data) {
                projectLoaderFactory.loadZip(data);
                CAST.project = $stateParams.project;
                setPath();
                // $http.get('/stories/' + $stateParams.project + '.json').success(function(data){
                //   CAST.appendNarrative(data);
                // })
              }).error(function () {
                console.error('project not found');
              });
            }
          }
          else {
            setPath();
          }
      }]
    }


    $urlRouterProvider
      .otherwise('/');

    $stateProvider
      .state('home',{
        url: '/',
        views: {
          'app': {
            templateUrl: '/homeScreen/homeScreen.html',
            controller:'HomeScreenCtrl'
          }
        }
      })
      .state('narrating', {
        url: '/:project',
        abstract: true,
        views: {
          'app': {
            templateUrl: 'app.html',
          },          
          'navigation@narrating': {
            templateUrl: '/navigation/navigation.html',
          }
        }
      })
      .state('narrating.viewer', {
        url: '/{path:.*}',
        resolve: resolveCASTObj,
        views: {
          'explorer': {
            templateUrl: '/explorer/explorer.html',
            controller: 'ExplorerCtrl'
          },
          'narrator': {
            templateUrl: '/narrator/narrator.html',
            controller: 'NarratorCtrl' 
          },
          'narratives@narrating.viewer': {
            templateUrl: '/narrator/viewer/viewer.html',
            controller: 'ViewerCtrl'
          }
        }
      })
      .state('narrating.viewer.playing', {
        
      })
      .state('narrating.writer', {
        url: '/{path:.*}',
        resolve: resolveCASTObj,
        views: {
          'explorer': {
            templateUrl: '/explorer/explorer.html',
            controller: 'ExplorerCtrl'
          },
          'narrator': {
            templateUrl: '/narrator/narrator.html',
            controller: 'NarratorCtrl' 
          },
          'narratives@narrating.writer': {
            templateUrl: '/narrator/writer/writer.html',
            controller: 'WriterCtrl' 
          }
        }
      })
  }])
  .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  }]);;

