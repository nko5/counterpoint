'use strict';

var express = require('express');
var path = require('path');
var app = express();
var instanceId = process.env.NODE_APP_INSTANCE;

app.set('views', path.resolve(__dirname, './views'));
app.engine('ejs', require('ejs').__express);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(req, res) {
  res.render('index.ejs', {});
});

app.listen(3000);

module.exports = app;

