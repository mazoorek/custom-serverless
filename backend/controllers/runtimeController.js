const clusterService = require("../services/clusterService");
const runtimeServiceRequest = require("../models/cluster/runtime/runtimeServiceRequest");
const runtimeDeploymentRequest = require("../models/cluster/runtime/runtimeDeploymentRequest");
const {CUSTOM_SERVERLESS_RUNTIME} = require("../models/cluster/namespaces");
const asyncHandler = require("../utils/asyncHandler");
const Application = require("../models/applicationModel");

exports.checkRuntime = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    let appRuntimes = (await clusterService.getAppRuntimes(appName)).body.items;
    let runtimeReady = true;
    if (appRuntimes.length === 0) {
        runtimeReady = false;
        await clusterService.createNamespacedService(CUSTOM_SERVERLESS_RUNTIME, runtimeServiceRequest(appName));
        await clusterService.createNamespacedDeployment(CUSTOM_SERVERLESS_RUNTIME, runtimeDeploymentRequest(appName, application.packageJson));
    } else {
        let numberOfRunningPods = (await clusterService.listRunningPods(appName)).body.items.length;
        if (numberOfRunningPods === 0) {
            runtimeReady = false;
        }
    }
    res.status(200).json({runtimeReady: runtimeReady});
});
