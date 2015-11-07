'use strict';

window.byrd.Blueprint = (function() {

  function Blueprint(chunkHashes, metadata, fileHash) {
    this.fileHash = fileHash;
    this.metadata = metadata;
    this.chunkHashes = chunkHashes;
  }

  return Blueprint;

})();
