'use strict';

var config = require('config');
var log = require('../lib/log');

function Get(req, res, next){
  res.status(200).json(config.get('servers'));
}

module.exports = {
  get: Get
};
