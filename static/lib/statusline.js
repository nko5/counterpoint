'use strict';

window.byrd.StatusLine = (function() {
  function StatusLine() {
    this._status = document.getElementById('indicator');
    this._text = document.getElementById('statusline').getElementsByClassName('status')[0];
  }

  StatusLine.prototype.setStatus = function(type, text) {
    this._status.setAttribute('class', type);
    this._text.innerHTML = text;
  };

  return StatusLine;
})();
