'use strict';

var pkg = require('../package.json');

var config = {
  "express": {
    "port": process.env.PORT || 3000
  },
  "name": pkg.name,
  "servers": [
    {address: '52.25.190.28', port: 3000},
    {address: '52.11.33.150', port: 3000},
    {address: '52.33.79.141', port: 3000}
  ]
}

module.exports = config;
