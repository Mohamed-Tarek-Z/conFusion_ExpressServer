var express = require('express');
var bodyParser = require('body-parser');
var authenticate = require('../authenticate');
var cors = require('./cors');
var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/').options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user }).populate('user').populate('dishes').exec((err, favs) => {

            if (err) return next(err);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favs);
        });
    }).post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user }, (err, fav) => {
            if (err) return next(err);

            if (!fav) {
                Favorites.create({ user: req.user }).then((fav) => {
                    for (let i = 0; i < req.body.length; i++)
                        if (fav.dishes.indexOf(req.body[i]._id))
                            fav.dishes.push(req.body[i]);
                    fav.save().then((fav) => {
                        Favorites.findById(fav._id).populate('user').populate('dishes').then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        })
                    }).catch((err) => {
                        return next(err);
                    });
                }).catch((err) => {
                    return next(err);
                })
            } else {
                for (let i = 0; i < req.body.length; i++)
                    if (fav.dishes.indexOf(req.body[i]._id))
                        fav.dishes.push(req.body[i]);
                fav.save().then((fav) => {
                    Favorites.findById(fav._id).populate('user').populate('dishes').then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);
                    })
                }).catch((err) => {
                    return next(err);
                });
            }
        });
    }).delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndRemove({ user: req.user }, (err, resp) => {
            if (err) return next(err);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        });
    });

favoriteRouter.route('/:dishId').options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user }).then((favs) => {
            if (!favs) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({ "exists": false, "favs": favs });
            } else {
                if (favs.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favs": favs });
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": true, "favs": favs });
                }
            }
        }, (err) => next(err)).catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user }, (err, fav) => {
            if (err) return next(err);

            if (!fav) {
                Favorites.create({ user: req.user }).then((fav) => {
                    fav.dishes.push({ "_id": req.params.dishId });
                    fav.save().then((fav) => {
                        Favorites.findById(fav._id).populate('user').populate('dishes').then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        })
                    }).catch((err) => {
                        return next(err);
                    });
                }).catch((err) => {
                    return next(err);
                })
            } else {
                if (fav.dishes.indexOf(req.params.dishId) < 0) {
                    fav.dishes.push({ "_id": req.params.dishId });
                    fav.save().then((fav) => {
                        Favorites.findById(fav._id).populate('user').populate('dishes').then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        })
                    }).catch((err) => {
                        return next(err);
                    })
                } else {
                    res.statusCode = 403;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Dish exist');
                }
            }
        });
    }).delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user }, (err, fav) => {
            if (err) return next(err);
            if (fav) {
                var index = fav.dishes.indexOf(req.params.dishId);
                if (index > -1) {
                    fav.dishes.splice(index, 1);
                    fav.save().then((fav) => {
                        Favorites.findById(fav._id).populate('user').populate('dishes').then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        })
                    }).catch((err) => {
                        return next(err);
                    })
                }
            } else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish donot exist');
            }
        });
    });


module.exports = favoriteRouter;