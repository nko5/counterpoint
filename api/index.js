'use strict';

var config = require('config');
var log = require('../lib/log');
var kademlia = require('kad');
var dht = kademlia(config.get('kad'));
log.info('Started kademelia on port ' + config.get('kad.port'));
log.info(' - Seed list: ' + JSON.stringify(config.get('kad.seeds')));

function Get(req, res, next){
  if(req.params && req.params.hash){
    log.info('Requesting: ' + req.params.hash);
    if(!dht.ready) return next();
    dht.get(req.params.hash, function(err, value){
      if(err){
        res.status(500).json({error: err});
      }else if(value){
        res.status(200).json({data: value});
      }else{
        res.status(404).json({error: 'Not found.'});
      }
    });
  }else{
    res.status(400).json({error: 'Invalid request'});
  }
}

function Put(req, res, next){
  if(req.params && req.params.hash && req.body.data){
    log.info('Putting: ' + req.params.hash);
    if(!dht.ready) return next();
    dht.put(req.params.hash, req.params.data, function(err){
      if(err){
        res.status(500).json({error: err});
      }else{
        res.status(201).json({error: 'File does not exist'});
      }
    });
  }else{
    res.status(400).json({error: 'Invalid request'});
  }
}

module.exports = {
  get: Get,
  put: Put
};
