'use strict';

var config = require('config');
var log = require('./log');
var kademlia = require('kad');

function DHT(){
  var dht = kademlia(config.get('kad'));
  var dhtWrapper = this;
  dhtWrapper.ready = false;
  dht.on('connect', function() {
    log.info('Started kademelia on port ' + config.get('kad.port'));
    log.info(' - Seed list: ' + config.get('kad.seeds'));
    dhtWrapper.ready = true;
  });
}

module.exports = new DHT();
