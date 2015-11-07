'use strict';

var winston = require('winston');
var config = require('config');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function() {
        return new Date();
      },
      formatter: function(options) {
        // Return string will be passed to logger.
        return options.timestamp() + ' ' + config.get('name') + ':' + config.get('instanceId') + ' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    })
  ]
});

module.exports = logger;
