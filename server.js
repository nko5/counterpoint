'use strict';

var express = require('express');
var app = express();
var instanceId = process.env.NODE_APP_INSTANCE;

app.use(express.static('public'));
app.listen(3000);

module.exports = app;
