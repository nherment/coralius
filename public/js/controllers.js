'use strict';

/* Controllers */

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('HomeCtrl', ['$scope', 'backend', '$log',

  function($scope, backend, $log) {

    setTimeout(function() {


    $scope.hourlyVisits = 0;
    $scope.dailyVisits = 0;
    $scope.dailyVisitors = 0;
    backend.send('track', {action: 'get:daily', type: 'resource', limit: 10}, function(err, dailyVisitList) {
      if(err) {
        $log.error(err)
      } else {
        var dailyVisits = 0;
        if(dailyVisitList && dailyVisitList.length > 0) {
          for(var i = 0 ; i < dailyVisitList.length ; i++) {

            dailyVisitList[i].date = new Date(dailyVisitList[i].date)

            dailyVisits += dailyVisitList[i].visits
          }
          $log.info('dailyVisitList', dailyVisitList)
          $scope.$apply(function() {
            $scope.dailyVisitList = dailyVisitList || []
            $scope.dailyVisits = dailyVisits
            $log.info('dailyVisits', dailyVisitList, dailyVisits)
          })
        } else {
          $log.info('no daily resource data')
        }
      }
    })
    backend.send('track', {action: 'get:daily', type: 'ip', limit: 10}, function(err, trackInfo) {
      if(err) {
        $log.error(err)
      } else {
        var dailyVisits = 0;
        if(trackInfo && trackInfo.length > 0) {

          for(var i = 0 ; i < trackInfo.length ; i++) {
            dailyVisits += trackInfo[i].visits
          }
          $log.info(trackInfo)
          $scope.$apply(function() {
            $scope.dailyVisitorList = trackInfo
            $scope.dailyVisitors = dailyVisits
          })
        } else {
          $log.info('no daily ip data')
        }
      }
    })



    backend.send('track', {action: 'get:history', type: 'resource'}, function(err, trackInfo) {
      var dailyVisits = 0;
      if(trackInfo && trackInfo.length > 0) {
        var graphData = []
        var data = {}
        var dates = []
        for(var i = 0 ; i < trackInfo.length ; i++) {

          trackInfo[i].date = new Date(trackInfo[i].date)
          if(dates.indexOf(trackInfo[i].date.getTime()) === -1) {
            dates.push(trackInfo[i].date.getTime())
          }

          if(!data[trackInfo[i].id]) {
            data[trackInfo[i].id] = {
              key: trackInfo[i].id,
              values: []
            }
            graphData.push(data[trackInfo[i].id])
          }
          data[trackInfo[i].id].values.push([trackInfo[i].date.getTime(), trackInfo[i].visits])

          dailyVisits += trackInfo[i].visits
        }

        dates.sort();

        for(var i = 0 ; i < dates.length ; i++) {
          for(var j = 0 ; j < graphData.length ; j++) {
            var hasDate = false;
            for(var k = 0 ; k < graphData[j].values.length ; k++) {
              if(graphData[j].values[k][0] === dates[i]) {
                hasDate = true;
                break;
              }
            }
            if(!hasDate) {
              graphData[j].values.push([dates[i], 0])
            }
          }
        }

        nv.addGraph(function() {
          var chart = nv.models.stackedAreaChart()
            .margin({right: 100})
            .x(function(d) { return d[0] })   //We can modify the data accessor functions...
            .y(function(d) { return d[1] })   //...in case your data is formatted differently.
            .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
            .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
            .transitionDuration(500)
            .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
            .clipEdge(true);

          //Format x-axis labels with custom function.
          chart.xAxis
            .tickFormat(function(d) {
              return d3.time.format('%A %e')(new Date(d))
            })

          chart.yAxis
            .tickFormat(d3.format(',.2f'));

          chart
            .style('fill','white')
            .style('stroke','white')


          d3.select('#chart svg')
            .datum(graphData)
            .call(chart);

          nv.utils.windowResize(chart.update);

          return chart;
        });

      }
    })
    }, 5000)
  }]);

phonecatControllers.controller('SignInCtrl', ['$scope', 'backend',
  function($scope, backend) {
//    backend.send('hello')
  }]);

phonecatControllers.controller('SignUpCtrl', ['$scope', 'backend',
  function($scope, backend) {
//    backend.send('hello')
  }]);
