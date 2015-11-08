'use strict';

window.byrd.APIClient = (function() {
  var NAMING_SERVICE_IP = '127.0.0.1';
  var NAMING_SERVICE_PORT = 3001;

  function APIClient() {
    this.servers = [];
    this.lastServer = 0;
  }

  APIClient.prototype.init = function(callback) {
    var self = this;
    this.servers = this._request('GET', '/servers', null, function(err, servers) {
      if (err) {
        return callback(err);
      }
      self.servers = servers;
      callback();
    });
  }

  APIClient.prototype.getBasePath = function() {
    var nextServer = this.lastServer + 1;
    if (nextServer >= this.servers.length) {
      nextServer = 0;
    }
    var server = this.servers[nextServer];
    this.lastServer = nextServer;
    return 'http://' + server.address + ':' + server.port + '/';
  };

  APIClient.prototype.get = function(key, callback) {
    this._request('GET', this.getBasePath() + encodeURIComponent(key), {}, callback);
  };

  APIClient.prototype.put = function(key, value, callback) {
    this._request('PUT', this.getBasePath() + encodeURIComponent(key), { data: value }, callback);
  };

  APIClient.prototype._request = function(verb, path, data, callback) {
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function() {
      var json = JSON.parse(xhr.responseText);

      if (xhr.status !== 200 && xhr.status !== 201 && xhr.status !== 304) {
        return callback(new Error(json.error));
      }

      callback(null, json);
    });

    xhr.open(verb, path);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  };

  APIClient.prototype.namingServicePut = function(name, blueprintHash, callback) {
    this._request('PUT', 'http://' + NAMING_SERVICE_IP + ':' + NAMING_SERVICE_PORT + '/namingservice/name/' + name, {blueprintHash: blueprintHash}, callback);
  };

  APIClient.prototype.namingServiceGet = function(name, callback) {
    this._request('GET', 'http://' + NAMING_SERVICE_IP + ':' + NAMING_SERVICE_PORT + '/namingservice/name/' + name, {}, callback);
  };

  return APIClient;

})();
