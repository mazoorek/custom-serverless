const clusterService = require("../services/clusterService");
const runtimeServiceRequest = require("../models/cluster/runtimeServiceRequest");
const runtimeDeploymentRequest = require("../models/cluster/runtimeDeploymentRequest");
const {CUSTOM_SERVERLESS_RUNTIME} = require("../models/cluster/namespaces");
const asyncHandler = require("../utils/asyncHandler");

exports.checkRuntime = asyncHandler(async (req, res) => {
    // TODO validation if clientAppName belongs to client
    let appName = req.params.clientAppName;
    let appRuntimes = 0;
    try {
        appRuntimes = (await clusterService.getAppRuntimes(appName)).body.items;
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: 'could not get appRuntimes'});
    }
    let runtimeReady = true;
    if (appRuntimes.length === 0) {
        runtimeReady = false;
        await clusterService.createNamespacedService(CUSTOM_SERVERLESS_RUNTIME, runtimeServiceRequest(appName)).catch(e => console.log(e));
        await clusterService.createNamespacedDeployment(CUSTOM_SERVERLESS_RUNTIME, runtimeDeploymentRequest(appName)).catch(e => console.log(e));
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