'use strict';

var instanceId = process.env.NODE_APP_INSTANCE || 0;
var levelup = require('levelup');
var pkg = require('../package.json');

var kadPort = 65000 + Number(instanceId);

var config = {
  "kad": {
    "address": "127.0.0.1",
    "port": 65000 + Number(instanceId),
    "seeds": [],
    "storage": levelup('/tmp/'+pkg.name+instanceId)
  },
  "express": {
    "port": 3000 + Number(instanceId)
  },
  "instanceId": instanceId,
  "name": pkg.name
}

[65000,65001,65002,65003].forEach(function(kp){
  if(kp !== kadPort){
    config.kad.seeds.push({
      { address: '127.0.0.1', port: kp }
    });
  }
});

module.exports = config;
