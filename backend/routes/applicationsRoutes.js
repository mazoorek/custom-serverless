const express = require('express');
const ingressController = require('../controllers/applicationsController');
const validateController = require("../controllers/validateController");
const router = express.Router({mergeParams: true});

router.route('/')
    .get(ingressController.getApps)
    .post(ingressController.createApp);

router.route('/:clientAppName/start')
    .post(ingressController.start);

router.route('/:clientAppName/dependencies')
    .post(validateController.dependencies);

router.route('/:clientAppName/functions')
    .post(ingressController.createFunction);

router.route('/:clientAppName/endpoints')
    .post(ingressController.createEndpoint);

module.exports = router;
