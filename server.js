'use strict';

var config = require('config');
var log = require('./lib/log');
var express = require('express');
var path = require('path');
var app = express();

app.set('views', path.resolve(__dirname, './views'));
app.engine('ejs', require('ejs').__express);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(req, res) {
  res.render('index.ejs', {});
});

app.use(express.static('public'));
app.listen(config.get('express.port'));
log.info('Started express server on ' + config.get('express.port'));
log.info('Started kademelia on port ' + config.get('kad.port'));
log.info(' - Seed list: ' + config.get('kad.seeds'));

var kademlia = require('kad');
var dht = kademlia(config.get('kad'))

// PM2 sends IPC message for graceful shutdown
process.on('message', function msgCb(msg) {
  if (msg === 'shutdown') {
    var db = config.get('storage');
    db.close(function(){
      log.info('Closed DB');
    });
  }
});

module.exports = app;
