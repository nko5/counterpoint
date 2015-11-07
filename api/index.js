'use strict';

var config = require('config');
var log = require('../lib/log');
var kademlia = require('kad');
var dht = kademlia(config.get('kad'));
log.info('Started kademelia on port ' + config.get('kad.port'));
log.info(' - Seed list: ' + JSON.stringify(config.get('kad.seeds')));

setTimeout(function() {
  config.get('kad.seeds').forEach(function(seed) {
    dht.connect(seed);
  });
}, 100);

function Get(req, res, next){
  if(req.params && req.params.hash){
    log.info('Requesting: ' + req.params.hash);
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
    dht.put(req.params.hash, req.body.data, function(err){
      if(err){
        res.status(500).json({error: err});
      }else{
        res.status(201).json({success: 'Data was put successfully'});
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
