'use strict';

window.byrd.Blueprint = (function() {

  function Blueprint(chunkHashes, metadata, fileHash, ext) {
    this.fileHash = fileHash;
    this.metadata = metadata;
    this.chunkHashes = chunkHashes;
    this.ext = ext;
  }

  return Blueprint;

})();
