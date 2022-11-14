var express = require('express');
var bodyParser = require('body-parser');
var authenticate = require('../authenticate');
var cors = require('./cors');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

var imagefilefilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Not Image file ??!'), false);
    }
    cb(null, true);
}

var upload = multer({ storage: storage, fileFilter: imagefilefilter });

var uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/').options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res) => {
        res.statusCode = 403;
        res.end('get opration is not supported on upload');
    }).put(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('put opration is not supported on upload');
    }).delete(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('delete opration is not supported on upload');
    }).post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    });

module.exports = uploadRouter;