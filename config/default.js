'use strict';

var pkg = require('../package.json');

var config = {
  "express": {
    "port": process.env.PORT || 3000
  },
  "name": pkg.name,
  "servers": []
}

module.exports = config;
