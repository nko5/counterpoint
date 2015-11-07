'use strict';

var pm2 = require('pm2');
var pkg = require('./package.json');

pm2.connect(function() {
  pm2.start({
    script    : 'server.js',         // Script to be run
    exec_mode : 'cluster',        // Allow your app to be clustered
    instances : 4,                // Optional: Scale your app by 4
    // max_memory_restart : '700M', // Optional: Restart your app if it reaches 100Mo
    name: pkg.name
  }, function(err, apps) {
    console.log('error', err);
    console.log('started');
    pm2.disconnect();
  });
});

function stopAll(){
  pm2.connect(function() {
    pm2.delete(pkg.name, function(err){
      pm2.disconnect();
    });
  });
}

// Ctrl+c or kill $pid
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

setInterval(function(){
  // run forever
}, 1000);
