var express = require('express');
var cors = require('./cors');
var authenticate = require('../authenticate');
var bodyParser = require('body-parser');
var Comments = require('../models/comments');
var commentRouter = express.Router();


commentRouter.use(bodyParser.json());

commentRouter.route('/').options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        Comments.find(req.query).populate('author').then((comments) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(comments);

        }, (err) => next(err)).catch((err) => next(err));
    }).post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.body != null) {
            req.body.author = req.body.user._id;
            Comments.create(req.body).then((comment) => {
                Comments.findById(comment._id).populate('author').then((comment) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                })
            }, (err) => next(err)).catch((err) => next(err));
        } else {
            err = new Error('Comments Not found in request body');
            err.status = 404;
            return next(err);
        }
    }).put(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('put opration is not supported on Comments');
    }).delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Comments.remove({}).then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

commentRouter.route('/:commentId').options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        Comments.findById(req.params.commentId).populate('author').then((comment) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(comment);
        }, (err) => next(err)).catch((err) => next(err));
    }).post(cors.corsWithOptions, (req, res) => {
        res.statusCode = 403;
        res.end('post opration is not supported on particular dish');
    }).put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId).populate('author').then((comment) => {
            if (comment != null) {
                if (comment.author.equals(req.user._id)) {
                    req.body.author = req.user._id;

                    Comments.findByIdAndUpdate(req.params.commentId, { $set: req.body }, { new: true }).then((comment) => {
                        Comments.findById(comment._id).populate('author').then((comment) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(comment);
                        });
                    }, (err) => next(err));
                } else {
                    err = new Error('Comment ' + req.params.commentId + ' Not found');
                    err.status = 404;
                    return next(err);
                }
            } else {
                err = new Error('this comment is not yours');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    }).delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId).then((comment) => {
            if (comment.author.equals(req.user._id)) {
                if (comment != null) {
                    Comments.findByIdAndRemove(req.params.commentId).then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    }, (err) => next(err)).catch((err) => next(err));
                } else {
                    err = new Error('Comment ' + req.params.commentId + ' Not found');
                    err.status = 404;
                    return next(err);
                }
            } else {
                err = new Error('this comment is not yours');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    });

module.exports = commentRouter;