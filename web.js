var express = require("express");
var app = express();
app.use(express.logger());

app.use(express.static('app'));
app.get('/', function(request, response) {
  //response.send('Hello World!');
  response.sendfile('app/index.html');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});