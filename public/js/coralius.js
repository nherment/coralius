(function() {

  if('undefined' === typeof performance) {
    return;
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

  var performanceEntriesIndex = 0;

  setTimeout(function() {
    var entries = performance.getEntries()
    if(entries && entries.length > performanceEntriesIndex) {
      var diff = entries.slice(performanceEntriesIndex, entries.length);
      var data = {
        entries: diff
      }
      if(performanceEntriesIndex === 0) {
        data.timing = performance.timing
        data.navigation = performance.navigation
      }
      performanceEntriesIndex = entries.length;
      sendRequest('http://localhost:4001/api/track/performance', data)
    }
  }, 100)

})();