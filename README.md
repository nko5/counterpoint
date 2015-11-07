# Byrd ~ Bring Your Restricted Documents

Byrd makes use of a DHT (Distributed Hash Table) to distribute encrypted chunks of documents amongst available peers. The Byrd UI allows you to choose a name for your document, and upload the file. The UI encrypts the file and breaks it into chunks, which are then distributed. The individual nodes will only have small, unusable pieces of the documents. See: [Plausible deniability](https://en.wikipedia.org/wiki/Plausible_deniability).

Byrd UI also allows you reassemble the files when provided the name of a previously uploaded file. The name is hashed, and the document's blueprint is fetched, identifying the location of the individual pieces, and then the pieces are fetched, reassembled, and unencrypted all in the UI.

## Quick Start

For the sake of the demo for the node knockout hackathon, we are running on a single modulus.io instance. But, since this application requires multiple nodes to operate, we are spawning 4 instances using [pm2](https://github.com/Unitech/pm2).

The web app is accessible on load balanced port 3000. The individual instances are each reachable on their own port 3001 - 3004.

The Kademelia DHT implementation is by [Gordon Hall's Kad project](http://github.com/gordonwritescode)

```
# getting the code
git@github.com:nko5/counterpoint.git && cd counterpoint

# running the demo
npm install
npm start

# running a real node
npm install -g pm2
pm2 start server.js --name byrd
```
### Configuring the seed list

Create the file config/local.json, and populate it with your seeds in the following format. This will override the default seed list.

```
{
  "kad": {
    "seeds": [
      { "address": "some.domain.name", port: 35000 },
      { "address": "some.other.name", port: 35000 },
    ]
  }
}
```
