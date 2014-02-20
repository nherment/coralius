'use strict';

/* App Module */

var coraliusApp = angular.module('coraliusApp', [
  'ngRoute',
  'coraliusControllers',
  'coraliusFilters',
  'coraliusServices'
]);

coraliusApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/signin', {
        templateUrl: 'partials/signin.html',
        controller: 'SignInCtrl'
      }).
      when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignUpCtrl'
      }).
      when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);
