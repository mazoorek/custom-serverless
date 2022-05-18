const Application = require("../models/applicationModel");
const clusterService = require('./clusterService');
const {CUSTOM_SERVERLESS_APPS} = require("../models/cluster/namespaces");
const clientAppServiceRequest = require("../models/cluster/client-app/clientAppServiceRequest");
const clientAppDeploymentRequest = require("../models/cluster/client-app/clientAppDeploymentRequest");
const clientAppIngressAppRequest = require("../models/cluster/client-app/clientAppIngressRequest");
exports.runAppsThatShouldBeUp = async () => {
    try {
        const applications = await Application.find({up: true}).select({"name": 1, "up": 1, "packageJson": 1, "__v": 1});
        const runningApps = await clusterService.listNamespacedService(CUSTOM_SERVERLESS_APPS);
        applications.forEach(async app => {
            if(!runningApps.body.items.find(item => item.metadata.name === app.name )) {
                await this.startApp(app);
            }
        });
    } catch (e) {
        console.log(e);
    }
};

exports.stopApp = async (appName) => {
    await clusterService.deleteNamespacedIngress(appName, CUSTOM_SERVERLESS_APPS);
    await clusterService.deleteNamespacedService(appName, CUSTOM_SERVERLESS_APPS);
    await clusterService.deleteNamespacedDeployment(appName, CUSTOM_SERVERLESS_APPS);
}

exports.startApp = async (application) => {
    await clusterService.createNamespacedService(CUSTOM_SERVERLESS_APPS, clientAppServiceRequest(application));
    await clusterService.createNamespacedDeployment(CUSTOM_SERVERLESS_APPS, clientAppDeploymentRequest(application.name, application.packageJson));
    await clusterService.createNamespacedIngress(CUSTOM_SERVERLESS_APPS, clientAppIngressAppRequest(application.name));
}
