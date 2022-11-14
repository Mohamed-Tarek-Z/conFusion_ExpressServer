var express = require('express');
var bodyParser = require('body-parser');
var authenticate = require('../authenticate');
var cors = require('./cors');

var Promos = require('../models/promos');

var promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/').options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        Promos.find(req.query).then((Promos) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Promos);
        }, (err) => next(err)).catch((err) => next(err));
    }).post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promos.create(req.body).then((promo) => {
            console.log('promo Created ', promo);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        }, (err) => next(err)).catch((err) => next(err));
    }).put(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('put opration is not supported on promos');
    }).delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promos.deleteMany({}).then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

promoRouter.route('/:promoId').options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        Promos.findById(req.params.promoId).then((promo) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        }, (err) => next(err)).catch((err) => next(err));
    }).post(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('post opration is not supported on particular promo');
    }).put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promos.findByIdAndUpdate(req.params.promoId, { $set: req.body }, { new: true }).then((promo) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
        }, (err) => next(err)).catch((err) => next(err));
    }).delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promos.findByIdAndRemove(req.params.promoId).then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

module.exports = promoRouter;