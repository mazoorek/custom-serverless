const express = require('express');
const ingressController = require('../controllers/ingressController');
const router = express.Router({mergeParams: true});

router.route('/')
    .get(ingressController.getApps)
    .post(ingressController.createApp);

module.exports = router;
