const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router({mergeParams: true});

router.route('/')
    .post(authController.signup);

module.exports = router;
