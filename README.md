# Byrd ~ Bring Your Restricted Documents

BYRD is a distributed network that allows you to share and access content with [Plausible deniability](https://en.wikipedia.org/wiki/Plausible_deniability). Files are encrypted, shredded, and disbursed all over the network. The chunks can be later retrieved and reassembled on your computer by using an easy to remember "alias".

Byrd UI connects to an [external REST API](https://github.com/niahmiah/kad-rest) that uses a DHT (Distributed Hash Table) implemented by [Gordon Hall's Kad project](http://github.com/gordonwritescode) to distribute encrypted chunks of documents amongst available peers. The Byrd UI allows you to choose an alias for your document, and upload the file. The UI encrypts the file and breaks it into chunks, which are then sent out via the API. The individual DHT nodes will only have small, unusable pieces of the documents.

Byrd UI allows you reassemble the files when provided the alias of a previously uploaded file. The alias is hashed, and the document's blueprint is fetched, identifying the location of the individual pieces, and the pieces are then fetched, reassembled, unencrypted, and displayed or saved via the UI.

## Quick Start

For the sake of the demo for the node knockout hackathon, we are running Byrd UI on the provided modulus.io instance at [http://counterpoint.2015.nodeknockout.com/](http://counterpoint.2015.nodeknockout.com/)

The external API is deployed to 3 EC2 instances, which are listed below. Jacques Crocker has been provided with root access to these machines to ensure they are really only running the open source project above, and to make sure no tampering will take place after the contest ends.

```
# getting the code
git clone git@github.com:nko5/counterpoint.git && cd counterpoint

# running the demo
npm install
npm start
```

### Configuring the server list

Create the file config/local.json, and populate it with your servers in the following format. This will override the default server list.

```
{"servers": [
  {"address": "52.25.190.28", "port": 3000},
  {"address": "52.11.33.150", "port": 3000},
  {"address": "52.33.79.141", "port": 3000}
]
```
