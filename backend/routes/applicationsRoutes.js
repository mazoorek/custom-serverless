const express = require('express');
const applicationsController = require('../controllers/applicationsController');
const router = express.Router({mergeParams: true});

router.route('/')
    .get(applicationsController.getApps)
    .post(applicationsController.createApp);

router.route('/:clientAppName')
    .delete(applicationsController.deleteApp)
    .patch(applicationsController.editAppName)
    .get(applicationsController.getApp);

router.route('/:clientAppName/start')
    .post(applicationsController.start);

router.route('/:clientAppName/stop')
    .post(applicationsController.stop);

router.route('/:clientAppName/dependencies')
    .get(applicationsController.getDependencies)
    .post(applicationsController.validateAndSaveDependencies);

router.route('/:clientAppName/functions')
    .post(applicationsController.createFunction);

router.route('/:clientAppName/functions/:functionName')
    .get(applicationsController.getFunction)
    .patch(applicationsController.editFunction)
    .delete(applicationsController.deleteFunction);

router.route('/:clientAppName/endpoints')
    .post(applicationsController.createEndpoint);

module.exports = router;
