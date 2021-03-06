'use strict';

var config = require('config');
var log = require('./lib/log');
var express = require('express');
var path = require('path');
var app = express();
var api = require('./api/index');
var bodyParser = require('body-parser')

app.set('views', path.resolve(__dirname, './views'));
app.engine('ejs', require('ejs').__express);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(req, res) {
  res.render('index.ejs', {});
});
app.use(bodyParser.json());
app.get('/servers', api.get);

app.use(express.static('public'));
var server = app.listen(config.get('express.port'));
log.info('Started express server on ' + config.get('express.port'));

function shutdown(){
  server.close(function() {
    log.info('Closed remaining http connections.');
    process.exit()
  });
}

process.on('uncaughtException', function errCb(err){
  log.error('Got uncaught exception: ' + err.stack);
  shutdown();
});

module.exports = app;
