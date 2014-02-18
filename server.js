var express = require('express');
var app = express();

app.use(express.bodyParser());

app.get('/', function(req, res){

  console.log(req.body, req.params, req.query);
  res.send('hello world');
});

app.listen(4001);
