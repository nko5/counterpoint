'use strict';

var instanceId = process.env.NODE_APP_INSTANCE || 0;
var pkg = require('../package.json');

var kadPort = 35000 + Number(instanceId);

var config = {
  "kad": {
    "address": "127.0.0.1",
    "port": 35000 + Number(instanceId),
    "seeds": [],
    "logLevel": 4
  },
  "express": {
    "port": 3000 + Number(instanceId)
  },
  "instanceId": instanceId,
  "name": pkg.name
}

var potentialPorts = [35000,35001,35002,35003];
potentialPorts.forEach(function(kp){
  if(kp !== kadPort){
    config.kad.seeds.push(
      { address: '127.0.0.1', port: kp }
    );
  }
});

module.exports = config;
