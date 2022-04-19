const express = require('express');
const testController = require('../controllers/testController');
const router = express.Router({mergeParams: true});

router.route('/')
    .post(testController.test);

module.exports = router;
