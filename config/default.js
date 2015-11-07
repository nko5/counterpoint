'use strict';

var instanceId = process.env.NODE_APP_INSTANCE || 0;
var levelup = require('levelup');
var pkg = require('../package.json');

var config = {
  "kad": {
    "address": "127.0.0.1",
    "port": 65535,
    "seeds": [
      {
        "address": "192.168.1.143",
        "port": 65535
      }
    ],
    "storage": levelup('/tmp/'+pkg.name+instanceId)
  },
  "express": {
    "port": 3000 + Number(instanceId)
  },
  "instanceId": instanceId,
  "name": pkg.name
}

module.exports = config;
