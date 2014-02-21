(function() {

  window.coralius = {
    reportUrl: function(url) {
      if('undefined' === typeof setInterval && 'undefined' === typeof window.performance) {
        return;
      }
      gatherAndSend(url)
    }
  }

  var sendRequest = function(url, postData, callback) {
    var req = createXMLHTTPObject();
    if (!req) return;
    var method = (postData) ? "POST" : "GET";
    req.open(method, url, true);
    if (postData) {
      req.setRequestHeader('Content-type','application/json');
    }
    req.onreadystatechange = function () {
      if (req.readyState != 4) return;
      if (req.status != 200 && req.status != 304) {
        return;
      }
      if(callback) {
        callback(req);
      }
    }
    if (req.readyState == 4) return;
    req.send(JSON.stringify(postData));
  }

  var XMLHttpFactories = [
    function () {return new XMLHttpRequest()},
    function () {return new ActiveXObject("Msxml2.XMLHTTP")},
    function () {return new ActiveXObject("Msxml3.XMLHTTP")},
    function () {return new ActiveXObject("Microsoft.XMLHTTP")}
  ];

  var createXMLHTTPObject = function() {
    var xmlhttp = false;
    for (var i=0;i<XMLHttpFactories.length;i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      }
      catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }

  function gatherAndSend(url) {

    url = url || '/api/track/performance';
    var interval = setInterval(function() {
      if(window.performance && window.performance.timing && window.performance.timing.loadEventEnd) {

        clearInterval(interval);

        var data = {
          entries: window.performance.getEntries(),
          timing: window.performance.timing,
          navigation: window.performance.navigation
        };
        sendRequest(url, data);
      }
    }, 100);

  }

})();