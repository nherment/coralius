'use strict';

/* Controllers */

var coraliusControllers = angular.module('coraliusControllers', []);

coraliusControllers.controller('HomeCtrl', ['$scope', 'backend', '$log',

  function($scope, backend, $log) {


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
//          $log.info('dailyVisitList', dailyVisitList)
          $scope.$apply(function() {
            $scope.dailyVisitList = dailyVisitList || []
            $scope.dailyVisits = dailyVisits
//            $log.info('dailyVisits', dailyVisitList, dailyVisits)

            $scope.dailyVisitsCurrentPage = 0
            $scope.dailyVisitsPageSize = 5
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
//          $log.info(trackInfo)
          $scope.$apply(function() {
            $scope.dailyVisitorList = trackInfo
            $scope.dailyVisitors = dailyVisits

            $scope.dailyVisitorsCurrentPage = 0
            $scope.dailyVisitorsPageSize = 5
          })
        } else {
          $log.info('no daily ip data')
        }
      }
    })



    var palette = new Rickshaw.Color.Palette();

    backend.send('track', {action: 'get:history', type: 'resource'}, function(err, trackInfo) {
      var dailyVisits = 0;
      if(trackInfo && trackInfo.length > 0) {
        var graphData = []
        var data = {}
        var dates = []
        for(var i = 0 ; i < trackInfo.length ; i++) {

          trackInfo[i].date = new Date(trackInfo[i].date)
          if(dates.indexOf(trackInfo[i].date.getTime()/1000) === -1) {
            dates.push(trackInfo[i].date.getTime()/1000)
          }

          if(!data[trackInfo[i].id]) {
            data[trackInfo[i].id] = {
              name: trackInfo[i].id,
              data: [],
              color: palette.color()
            }
            graphData.push(data[trackInfo[i].id])
          }
          data[trackInfo[i].id].data.push({x: trackInfo[i].date.getTime()/1000, y: trackInfo[i].visits})

          data[trackInfo[i].id].data.sort(function(a, b) {
            var sort = a.x - b.x
            return sort
          })
          dailyVisits += trackInfo[i].visits
        }

        for(var i = 0 ; i < dates.length ; i++) {
          for(var j = 0 ; j < graphData.length ; j++) {
            var hasDate = false;
            for(var k = 0 ; k < graphData[j].data.length ; k++) {
              if(graphData[j].data[k].x === dates[i]) {
                hasDate = true;
                break;
              }
            }
            if(!hasDate) {
              graphData[j].data.push({x: dates[i], y:0})
              graphData[j].data.sort(function(a, b) {
                var sort = a.x - b.x
                return sort
              })
            }
          }
        }

        var graph = new Rickshaw.Graph({
          element: document.querySelector("#chart"),
          stroke: true,
          strokeWidth: 2,
          xScale: d3.time.scale(),
          series: graphData
        })

        var x_axis = new Rickshaw.Graph.Axis.Time({
          graph: graph
//          tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        })

//        var y_axis = new Rickshaw.Graph.Axis.Y({
//          graph: graph,
//          orientation: 'left',
//          tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
//          element: document.getElementById('y_axis')
//        })

        var legend = new Rickshaw.Graph.Legend({
          element: document.querySelector('#legend'),
          graph: graph
        })
        var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
          graph: graph,
          legend: legend
        });
        var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
          graph: graph,
          legend: legend
        });

        var hoverDetail = new Rickshaw.Graph.HoverDetail( {
          graph: graph,
          xFormatter: function(x) { return new Date(x * 1000).toDateString() },
          yFormatter: function(y) { return y + ' hits' }
        })

        graph.render()

      }
    })
  }])

coraliusControllers.controller('SignInCtrl', ['$scope', 'backend',
  function($scope, backend) {
//    backend.send('hello')
  }]);

coraliusControllers.controller('SignUpCtrl', ['$scope', 'backend',
  function($scope, backend) {
//    backend.send('hello')
  }])
