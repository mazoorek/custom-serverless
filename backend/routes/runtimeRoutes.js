const express = require('express');
const runtimeController = require('../controllers/runtimeController');
const router = express.Router({mergeParams: true});

router.route('/:clientAppName')
    .get(runtimeController.checkRuntime);

module.exports = router;
