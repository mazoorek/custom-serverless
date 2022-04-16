const express = require('express');
const clusterService = require('../services/clusterService');
const router = express.Router({mergeParams: true});

router.get('/:clientAppName', async (req, res) => {
    // TODO validation if clientAppName belongs to client
    let appName = req.params.clientAppName;
    let appRuntimes = 0;
    try {
        // const response = await clusterService.getAppRuntimes(appName);
        appRuntimes = (await clusterService.getAppRuntimes(appName)).body.items;
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'could not get appRuntimes'});
    }
    let runtimeReady = true;
    if (appRuntimes.length === 0) {
        runtimeReady = false;
        let serviceRequest = clusterService.createRuntimeServiceRequest(appName);
        let deploymentRequest = clusterService.createRuntimeDeploymentRequest(appName);
        await clusterService.createNamespacedService('custom-serverless-runtime', serviceRequest).catch(e => console.log(e));
        await clusterService.createNamespacedDeployment('custom-serverless-runtime', deploymentRequest).catch(e => console.log(e));
    } else {
        let numberOfRunningPods = 0;
        try {
            numberOfRunningPods = (await clusterService.listRunningPods(appName)).body.items.length;
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: 'could not get numberOfRunningPods'});
        }
        if (numberOfRunningPods === 0) {
            runtimeReady = false;
        }
    }
    res.status(200).json({runtimeReady: runtimeReady});
});

module.exports = router;
