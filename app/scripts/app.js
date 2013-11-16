'use strict';

angular.module('vinolatorWebApp', [
  'ngResource'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/convert.html',
        controller: 'ConvertCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
