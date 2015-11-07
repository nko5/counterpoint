/**
 * byrd/shredder
 */

'use strict';

if (typeof window.byrd === 'undefined') {
  window.byrd = {};
}

window.byrd.Shredder = (function() {

  var MIN_CHUNKS = 10;

  var bitcore = require('bitcore-lib');
  var sha256 = bitcore.crypto.Hash.sha256;
  var Buffer = bitcore.deps.Buffer;
  var buffer = bitcore.util.buffer;

  function Shredder(file) {
    this._reader = new FileReader();
    this._file = file;
    this._chunks = [];
  }

  Shredder.prototype.shred = function(callback) {
    var self = this;

    this._reader.onloadend = function() {
      var result = this.result;

      var metadata = result.split(',')[0];
      self._metadata = metadata;
      var fileContent = result.split(',')[1];

      var fileContentBuffer = new Buffer(fileContent, 'base64');

      var fileHash = sha256(fileContentBuffer);

      self._fileHash = fileHash;
      var encryptedFile = Aes.Ctr.encrypt(fileContent, self._fileHash, 256);

      var remainder = encryptedFile.length % 10;
      var chunkSize = (encryptedFile.length - remainder) / 10;
      var iterations = 10;
      var position = 0;

      for (var i = 0; i < iterations; i++) {
        var encryptedChunk = encryptedFile.slice(position, position + chunkSize);
        self._chunks.push(encryptedChunk);
        position = position + chunkSize;
      }

      if (remainder > 0) {
        var buttChunk = encryptedFile.slice(position, encryptedFile.length); // LOL
        self._chunks.push(buttChunk);
      }

      callback(null, self._chunks);
    };

    this._reader.readAsDataURL(this._file);
  };

  Shredder.prototype.getHash = function() {
    return this._fileHash;
  };

  Shredder.prototype.getMetadata = function() {
    return this._metadata;
  };

  Shredder.prototype.unshred = function(fileHash, chunks, callback) {
    var encryptedFileString = '';

    for (var i = 0; i < chunks.length; i++) {
      encryptedFileString += chunks[i];
    }

    var decryptedFileString = Aes.Ctr.decrypt(encryptedFileString, fileHash, 256);

    callback(null, decryptedFileString);
  };

  var input = document.getElementById('file');

  input.addEventListener('change', function() {
    var file = this.files[0];
    var shredder = new Shredder(file);

    shredder.shred(function(err, chunks) {
      var fileHash = shredder.getHash();
      shredder.unshred(fileHash, chunks, function(err, url) {
        var metadata = shredder.getMetadata();
        var open = metadata + ',' + url;
        window.open(open);
      });
    });
  });

  return Shredder;

})();
