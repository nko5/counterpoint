'use strict';

document.addEventListener('DOMContentLoaded', function() {

  var bitcore = require('bitcore-lib');
  var Buffer = bitcore.deps.Buffer;
  var sha256 = bitcore.crypto.Hash.sha256;
  var shredForm = document.getElementById('shred-form');
  var unshredForm = document.getElementById('unshred-form');
  var statusline = new byrd.StatusLine();

  var api = new byrd.APIClient();

  shredForm.addEventListener('submit', function() {
    var input = document.getElementById('file');
    var file = input.files[0];
    var shredder = new byrd.Shredder(file);
    var blueprintName = document.getElementById('blueprint-name').value;

    statusline.setStatus('working', 'Checking for conflicting name...');

    api.get(blueprintName, function(err, value){
      // If there is an error that means that should mean that the key is available
      if(err) {
        statusline.setStatus('success', 'Name available!');

        shredder.shred(function(err, chunks) {

          statusline.setStatus('success', 'File shredded into ' + chunks.length + '!');

          async.mapLimit(chunks, 4, function(chunk, done) {
            var hash = sha256(new Buffer(chunk, 'base64')).toString('base64');

            statusline.setStatus('working', 'Distributing chunk ' + hash + '...');

            api.put(hash, chunk, function(err, result) {
              statusline.setStatus('success', 'Chunk distributed!');
              done(err, hash);
            });
          }, function(err, chunkHashes) {
            if (err) {
                return statusline.setStatus('failed', 'Failed to distribute all chunks.');
            }

            var blueprint = new byrd.Blueprint(chunkHashes, shredder.getMetadata(), shredder.getHash());
            var blueprintHash = sha256(new Buffer(JSON.stringify(blueprint), 'base64')).toString('base64');

            statusline.setStatus('working', 'Distributing file blueprint...');

            api.put(blueprintHash, JSON.stringify(blueprint), function(err, result) {
              if (err) {
                return statusline.setStatus('failed', 'Failed to distribute file blueprint!');
              }

              statusline.setStatus('working', 'Registering alias name for file blueprint...');

              api.put(blueprintName, blueprintHash, function(err){
                if (err) {
                  return statusline.setStatus('failed', 'Failed to register alias name for file blueprint!');
                }
              })

              statusline.setStatus('success', 'File encrpyted, shredded, and distributed. Share your alias name!');
            });
          });
        });
      }
    });


  });

  unshredForm.addEventListener('submit', function() {
    var blueprintName = document.getElementById('unshred-blueprint-name').value;

    statusline.setStatus('working', 'Querying peers for file blueprint...');

    api.get(blueprintName, function(err, result){
      var blueprintHash = result.data;

      if (err) {
        return statusline.setStatus('failed', 'Failed to lookup blueprint location!');
      }

      statusline.setStatus('working', 'Querying peers for file blueprint...');

      api.get(blueprintHash, function(err, result) {
        if (err) {
          return statusline.setStatus('failed', 'Failed to find file blueprint!');
        }

        var blueprint = JSON.parse(result.data);
        var shredder = new byrd.Shredder();

        statusline.setStatus('working', 'Got file blueprint, querying peers for chunks...');

        async.map(blueprint.chunkHashes, function(hash, done) {
          api.get(hash, done);
        }, function(err, results) {
          if (err) {
            return statusline.setStatus('failed', 'Failed to resolve all file chunks!');
          }

          var chunks = results.map(function(result) {
            return result.data;
          });

          statusline.setStatus('working', 'Assembling file chunks and decrypting...');

          shredder.unshred(blueprint.fileHash, chunks, function(err, url) {
            if (err) {
              return statusline.setStatus('failed', 'Failed to assemble file chunks and decrypt!');
            }

            var dataURI = blueprint.metadata + ',' + url;

            statusline.setStatus('success', 'File resolved! Thank you, come again!');
            window.open(dataURI);
          });
        });
      });
    })


  });

});
