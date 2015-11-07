'use strict';

document.addEventListener('DOMContentLoaded', function() {

  var bitcore = require('bitcore-lib');
  var Buffer = bitcore.deps.Buffer;
  var sha256 = bitcore.crypto.Hash.sha256;
  var input = document.getElementById('file');
  var api = new APIClient();

  input.addEventListener('change', function() {
    var file = this.files[0];
    var shredder = new byrd.Shredder(file);

    shredder.shred(function(err, chunks) {

      async.mapLimit(chunks, 4, function(done) {
        var hash = sha256(new Buffer(chunk, 'base64'));
        api.put(hash, chunk, function(err, result) {
          console.log(result);
          done(err, hash);
        });
      }, function(err, chunkHashes) {
        if (err) {
            return console.log(err);
        }

        var blueprint = new byrd.Blueprint(chunkHashes, shredder.getMetadata());
        var blueprintHash = sha256(JSON.stringify(blueprint));

        console.log(blueprint);

        api.put(blueprintHash, JSON.stringify(blueprint), function(err, result) {
          if (err) {
            return console.log(err);
          }

          console.log(result);
        });
      });

      var fileHash = shredder.getHash();
      shredder.unshred(fileHash, chunks, function(err, url) {
        var metadata = shredder.getMetadata();
        var open = metadata + ',' + url;
        window.open(open);
      });
    });
  });

});
