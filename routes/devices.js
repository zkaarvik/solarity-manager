var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Device = require('../models/Device.js');

/* GET /devices */
router.get('/', function(req, res, next) {
    Device.find(function (err, devices) {
        if (err) return next(err);
        res.json(devices);
    });
});

/* GET /devices/id */
router.get('/:id', function(req, res, next) {
  Device.findById(req.params.id, function (err, device) {
    if (err) return next(err);
    res.json(device);
  });
});

/* POST /devices */
router.post('/', function(req, res, next) {
    Device.create(req.body, function (err, device) {
        if (err) return next(err);
        res.json(device);
    });
});

/* PUT /devices/:id */
router.put('/:id', function(req, res, next) {
    Device.findByIdAndUpdate(req.params.id, req.body, function (err, device) {
        if (err) return next(err);
        res.json(device);
    });
});

/* DELETE /todos/:id */
router.delete('/:id', function(req, res, next) {
    Device.findByIdAndRemove(req.params.id, req.body, function (err, device) {
        if (err) return next(err);
        res.json(device);
    });
});

module.exports = router;