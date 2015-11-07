'use strict';

window.byrd.Blueprint = (function() {

  function Blueprint(chunkHashes, metadata) {
      this.metadata = metadata;
      this.chunkHashes = chunkHashes;
  }

  return Blueprint;

})();
