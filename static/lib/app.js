'use strict';

document.addEventListener('DOMContentLoaded', function() {

  var bitcore = require('bitcore-lib');
  var Buffer = bitcore.deps.Buffer;
  var sha256 = bitcore.crypto.Hash.sha256;
  var shredForm = document.getElementById('shred-form');
  var unshredForm = document.getElementById('unshred-form');

  var api = new byrd.APIClient();

  shredForm.addEventListener('submit', function() {
    var input = document.getElementById('file');
    var file = input.files[0];
    var shredder = new byrd.Shredder(file);
    var blueprintName = document.getElementById('blueprint-name').value;

    api.get(blueprintName, function(err, value){
      // If there is an error that means that should mean that the key is available
      if(err) {
        shredder.shred(function(err, chunks) {

          async.mapLimit(chunks, 4, function(chunk, done) {
            var hash = sha256(new Buffer(chunk, 'base64')).toString('base64');

            api.put(hash, chunk, function(err, result) {
              done(err, hash);
            });
          }, function(err, chunkHashes) {
            if (err) {
                return console.log(err);
            }

            var blueprint = new byrd.Blueprint(chunkHashes, shredder.getMetadata(), shredder.getHash());
            var blueprintHash = sha256(new Buffer(JSON.stringify(blueprint), 'base64')).toString('base64');

            api.put(blueprintHash, JSON.stringify(blueprint), function(err, result) {
              if (err) {
                return console.log(err);
              }

              api.put(blueprintName, blueprintHash, function(err){
                if (err) {
                  return console.log(err);
                }
              })

              console.log('Done! Blueprint key: %s', result);
            });
          });
        });
      }
    });


  });

  unshredForm.addEventListener('submit', function() {
    var blueprintName = document.getElementById('unshred-blueprint-name').value;

    api.get(blueprintName, function(err, result){
      var blueprintHash = result.data;
      
      if (err) {
        return console.log(err);
      }
      api.get(blueprintHash, function(err, result) {
        if (err) {
          return console.log(err);
        }

        var blueprint = JSON.parse(result.data);
        var shredder = new byrd.Shredder();

        async.map(blueprint.chunkHashes, function(hash, done) {
          api.get(hash, done);
        }, function(err, results) {
          if (err) {
            return console.log(err);
          }

          var chunks = results.map(function(result) {
            return result.data;
          });

          console.log(blueprint.fileHash, chunks)

          shredder.unshred(blueprint.fileHash, chunks, function(err, url) {
            if (err) {
              return console.log(err);
            }

            console.log(url);

            var dataURI = blueprint.metadata + ',' + url;

            window.open(dataURI);
          });
        });
      });
    })


  });

});
