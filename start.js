'use strict';

var pm2 = require('pm2');
var pkg = require('./package.json');

pm2.connect(function() {
  pm2.start({
    script    : 'server.js',         // Script to be run
    exec_mode : 'cluster',        // Allow your app to be clustered
    instances : 4,                // Optional: Scale your app by 4
    // max_memory_restart : '700M', // Optional: Restart your app if it reaches 100Mo
    name: pkg.name,
    merge_logs: true
  }, function(err, apps) {
    pm2.list(function(err, list){
      list.forEach(function(instance){
        console.log('Started instance: ' + instance.name + ' ' + instance.pm_id);
      });
      console.log('Output log redirected to log: ' + list[0].pm2_env.pm_out_log_path);
      console.log('Error log redirected to: ' + list[0].pm2_env.pm_err_log_path);
      pm2.disconnect();
    });
  });
});

function stopAll(){
  pm2.connect(function() {
    pm2.stop(pkg.name, function(err){
      setTimeout(function(){
        pm2.delete(pkg.name, function(err){
          pm2.disconnect();
        });
      }, 2000);
    });
  });
}

// Ctrl+c or kill $pid
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

setInterval(function(){
  // run forever
}, 1000);
