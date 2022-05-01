const express = require('express');
const ingressController = require('../controllers/applicationsController');
const router = express.Router({mergeParams: true});

router.route('/')
    .get(ingressController.getApps)
    .post(ingressController.createApp);

router.route('/:clientAppName')
    .post(ingressController.launchApp);

router.route('/:clientAppName/functions')
    .post(ingressController.createFunction);

router.route('/:clientAppName/endpoints')
    .post(ingressController.createEndpoint);

module.exports = router;
