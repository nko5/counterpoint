'use strict';

document.addEventListener('DOMContentLoaded', function() {

  var bitcore = require('bitcore-lib');
  var Buffer = bitcore.deps.Buffer;
  var sha256 = bitcore.crypto.Hash.sha256;
  var shredForm = document.getElementById('shred-form');
  var unshredForm = document.getElementById('unshred-form');
  var dropzone = document.getElementById('dropzone');
  var statusline = new byrd.StatusLine();
  var api = new byrd.APIClient();
  var fileInput = document.getElementById('file');
  var nameFields = document.getElementById('distribute-name-fields');
  var goback = document.getElementById('goto-dropzone');
  var search = document.getElementById('byrd-search');

  function chompChompChomp() {
    var logo = document.getElementById('logo');
    logo.setAttribute('style', 'background-image:url("static/byrd.gif")');
  }

  function stopChompChomp() {
    setTimeout(function() {
      var logo = document.getElementById('logo');
      logo.removeAttribute('style');
      toggleFormState();
    }, 700);
  }

  function toggleFormState() {
    if (!dropzone.getAttribute('style')) {
      dropzone.setAttribute('style', 'display:none');
    } else {
      dropzone.removeAttribute('style');
    }

    if (!nameFields.getAttribute('style')) {
      nameFields.setAttribute('style', 'display:none');
    } else {
      nameFields.removeAttribute('style');
    }
  };

  search.addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('search-button').click();
  });

  goback.addEventListener('click', function(e) {
    e.preventDefault();
    toggleFormState();
  });

  fileInput.addEventListener('change', function(e) {
    toggleFormState();
    e.preventDefault();
  });

  dropzone.addEventListener('click', function(e) {
    document.getElementById('file').click();
  });

  dropzone.addEventListener('drop', function(e) {
    var files = e.dataTransfer.files;
    var input = document.getElementById('file');

    input.files = files;

    e.preventDefault();
    return false;
  });

  dropzone.addEventListener('dragover', function(e) {
    this.setAttribute('class', 'hover');
  });

  dropzone.addEventListener('dragleave', function(e) {
    this.removeAttribute('class');
  });

  shredForm.addEventListener('submit', function(e) {
    e.preventDefault();
  });

  window.addEventListener('dragover',function(e){
    e = e || event;
    e.preventDefault();
  },false);

  window.addEventListener('drop',function(e){
    e = e || event;
    e.preventDefault();
  },false);

  api.init(function(err) {
    if (err) {
      statusline.setStatus('failed', 'Unable to initialize connection to database.');
    }

  shredForm.addEventListener('submit', function() {
    var input = document.getElementById('file');
    var file = input.files[0];
    var shredder = new byrd.Shredder(file);
    var blueprintName = document.getElementById('blueprint-name').value;

    statusline.setStatus('working', 'Checking for conflicting name...');

    api.get(blueprintName, function(err, value){
      // If there is an error that means that should mean that the key is available
      if(value){
        return statusline.setStatus('failed', 'Name already exists.');
      }
      if(err) {
        statusline.setStatus('success', 'Name available!');

        chompChompChomp();
        shredder.shred(function(err, chunks) {

          statusline.setStatus('success', 'File shredded into ' + chunks.length + '!');

          var chunksStarted = 0;
          var chunksDistributed = 0;

          async.mapLimit(chunks, 4, function(chunk, done) {
            chunksStarted++;
            var hash = sha256(new Buffer(chunk, 'base64')).toString('base64');

            // statusline.setStatus('working', 'Distributing chunk ' + hash + '...');
            statusline.setStatus('working', 'Distributing chunk ' + chunksStarted + ' of ' + chunks.length + '. ' + chunksDistributed + ' completed.');

            api.put(hash, chunk, function(err, result) {
              chunksDistributed++;

              done(err, hash);
            });
          }, function(err, chunkHashes) {
            if (err) {
                stopChompChomp();
                return statusline.setStatus('failed', 'Failed to distribute all chunks.');
            }

            var nameParts = shredder._file.name.split('.');
            var ext = nameParts[nameParts.length - 1];
            var blueprint = new byrd.Blueprint(chunkHashes, shredder.getMetadata(), shredder.getHash(), ext);
            var blueprintHash = sha256(new Buffer(JSON.stringify(blueprint), 'base64')).toString('base64');

            statusline.setStatus('working', 'Distributing file blueprint...');

            api.put(blueprintHash, JSON.stringify(blueprint), function(err, result) {
              if (err) {
                stopChompChomp();
                return statusline.setStatus('failed', 'Failed to distribute file blueprint!');
              }

              statusline.setStatus('working', 'Registering alias name for file blueprint...');

              api.put(blueprintName, blueprintHash, function(err){
                stopChompChomp();

                if (err) {
                  return statusline.setStatus('failed', 'Failed to register alias name for file blueprint!');
                }

                statusline.setStatus('success', 'File encrpyted, shredded, and distributed. Share your alias name!');
              });
            });
          });
        });
      }
    });


  });

  unshredForm.addEventListener('submit', function() {
    var blueprintName = document.getElementById('unshred-blueprint-name').value;
    var container = document.getElementById('downloadme');

    container.innerHTML = '';

    statusline.setStatus('working', 'Querying peers for file blueprint...');

    api.get(blueprintName, function(err, result){
      if (err) {
        return statusline.setStatus('failed', 'Failed to lookup blueprint location!');
      }

      if (!result || !result.data) {
        return statusline.setStatus('failed', 'Could not find data for: ' + blueprintName);
      }

      var blueprintHash = result.data;

      statusline.setStatus('working', 'Querying peers for file blueprint...');

      api.get(blueprintHash, function(err, result) {
        if (err) {
          return statusline.setStatus('failed', 'Failed to find file blueprint!');
        }

        var blueprint = JSON.parse(result.data);
        var shredder = new byrd.Shredder();

        statusline.setStatus('working', 'Got file blueprint, querying peers for chunks...');

        var numChunksReceived = 0;

        async.mapLimit(blueprint.chunkHashes, 15, function(hash, done) {
          api.get(hash, function(err, result){
            numChunksReceived++;
            statusline.setStatus('working', 'Recieved file chunk ' + numChunksReceived + ' of ' + blueprint.chunkHashes.length);
            done(err, result);
          });
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

            var filename = blueprint.ext ? (blueprintName + '.' + blueprint.ext) : null;
            var dataURI = blueprint.metadata + ',' + url;

            statusline.setStatus('success', 'File resolved! Thank you, come again!');
            // shredder.download(dataURI);
            var downloadLink = shredder.getDownloadLink(dataURI, filename);

            container.innerHTML = '';
            container.appendChild(downloadLink);
          });
        });
      });
    })

  });


  });



});
