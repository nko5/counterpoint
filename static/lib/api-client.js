'use strict';

window.byrd.APIClient = (function() {

  function APIClient() {

  }

  APIClient.prototype.get = function(key, callback) {
    this._request('GET', '/' + encodeURIComponent(key), {}, callback);
  };

  APIClient.prototype.put = function(key, value, callback) {
    this._request('PUT', '/' + encodeURIComponent(key), { data: value }, callback);
  };

  APIClient.prototype._request = function(verb, path, data, callback) {
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function() {
      var json = JSON.parse(xhr.responseText);

      if (xhr.status !== '200' && xhr.status !== '201') {
        return callback(new Error(json.error));
      }

      callback(null, json);
    });

    xhr.open(verb, path);
    xhr.send(JSON.stringify(data));
  };

  return APIClient;

})();
