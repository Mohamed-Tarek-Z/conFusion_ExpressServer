var express = require('express');
var cors = require('cors');
var app = express();

var whitelist = ['http://localhost:3000', 'http://localhost:3001', 'https://localhost:3443', 'http://localhost:4200'];
var corsOptionsDelegate = (req, cb) => {
    var corsOptions;

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    } else {
        corsOptions = { origin: false }
    }
    cb(null, corsOptions);
}

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);