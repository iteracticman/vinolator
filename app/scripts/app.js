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
    .otherwise({
      redirectTo: '/'
    });
});