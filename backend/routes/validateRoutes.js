const express = require('express');
const validateController = require('../controllers/validateController');
const router = express.Router({mergeParams: true});

router.route('/')
    .post(validateController.validate);

module.exports = router;
