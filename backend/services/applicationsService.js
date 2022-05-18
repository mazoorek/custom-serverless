const Application = require("../models/applicationModel");
const clusterService = require('./clusterService');
const {CUSTOM_SERVERLESS_APPS} = require("../models/cluster/namespaces");
const clientAppServiceRequest = require("../models/cluster/client-app/clientAppServiceRequest");
const clientAppDeploymentRequest = require("../models/cluster/client-app/clientAppDeploymentRequest");
const clientAppIngressAppRequest = require("../models/cluster/client-app/clientAppIngressRequest");
exports.runAppsThatShouldBeUp = async () => {
    try {
        const applications = await Application.find({up: true}).select({"name": 1, "up": 1, "packageJson": 1});
        const runningApps = await clusterService.listNamespacedService(CUSTOM_SERVERLESS_APPS);
        applications.forEach(async app => {
            if(!runningApps.body.items.find(item => item.metadata.name === app.name )) {
                await clusterService.createNamespacedService(CUSTOM_SERVERLESS_APPS, clientAppServiceRequest(app.name));
                await clusterService.createNamespacedDeployment(CUSTOM_SERVERLESS_APPS, clientAppDeploymentRequest(app.name, app.packageJson));
                await clusterService.createNamespacedIngress(CUSTOM_SERVERLESS_APPS, clientAppIngressAppRequest(app.name));
            }
        });
    } catch (e) {
        console.log(e);
    }
};
