'use strict';

var pkg = require('../package.json');

var config = {
  "express": {
    "port": process.env.PORT || 3000
  },
  "name": pkg.name,
  "servers": [
    {address: '52.33.17.249', port: 3000},
    {address: '52.33.127.114', port: 3000},
    {address: '52.33.113.239', port: 3000}
  ]
}

module.exports = config;
