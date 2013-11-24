'use strict';

var mod = angular.module('vinolatorWebApp', [
  'ngResource'
]);

mod.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/convert.html',
      controller: 'ConvertCtrl'
    })
    .when('/info', {
      templateUrl: 'views/info.html'
    })
    .when('/apps', {
      templateUrl: 'views/apps.html'
    })
    .otherwise({
      redirectTo: '/'
    });
});