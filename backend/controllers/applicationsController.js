const clusterService = require("../services/clusterService");
const clientAppIngressAppRequest = require("../models/cluster/client-app/clientAppIngressRequest");
const clientAppDeploymentRequest = require("../models/cluster/client-app/clientAppDeploymentRequest");
const clientAppServiceRequest = require("../models/cluster/client-app/clientAppServiceRequest");
const {CUSTOM_SERVERLESS_APPS} = require("../models/cluster/namespaces");
const asyncHandler = require("../utils/asyncHandler");
const Application = require('./../models/applicationModel');

exports.getApps = asyncHandler( async  (req, res) => {
    const applications = await Application.find().select({ "name": 1, "_id": 0, "up": 1});
    res.status(200).json(applications);
});

exports.getDependencies = asyncHandler( async  (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    res.status(200).json({packageJson: application.packageJson});
});

exports.getRunningApps = asyncHandler(async (req, res) => {
    let ingresses = await clusterService.listNamespacedIngress(CUSTOM_SERVERLESS_APPS);
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
});

exports.createApp = asyncHandler(async (req, res) => {
    await Application.create({
        name: req.body.clientAppName,
        user: req.user.id
    });
    res.status(201).json({});
});

exports.deleteApp = asyncHandler(async (req, res) => {
    await Application.deleteOne({
        name: req.params.clientAppName,
        user: req.user.id
    });
    res.status(200).json({});
});

exports.getApp = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    res.status(200).json(application);
});

exports.editAppName = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    application.name = req.body.newAppName;
    await application.save();
    res.status(200).json();
});

exports.start = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.up = true;
    await application.save();
    await clusterService.createNamespacedService(CUSTOM_SERVERLESS_APPS, clientAppServiceRequest(appName));
    await clusterService.createNamespacedDeployment(CUSTOM_SERVERLESS_APPS, clientAppDeploymentRequest(appName, application.packageJson));
    // TODO add label with app version to ingress
    await clusterService.createNamespacedIngress(CUSTOM_SERVERLESS_APPS, clientAppIngressAppRequest(appName));
    res.status(200).json({});
});

exports.stop = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.up = false;
    await application.save();
    await clusterService.deleteNamespacedIngress(appName, CUSTOM_SERVERLESS_APPS);
    await clusterService.deleteNamespacedService(appName, CUSTOM_SERVERLESS_APPS);
    await clusterService.deleteNamespacedDeployment(appName, CUSTOM_SERVERLESS_APPS);
    res.status(200).json({});
});

exports.createFunction = asyncHandler(async (req, res) => {
    const application = await Application.findOne({name: req.params.clientAppName});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    application.functions.push({
        name: req.body.name,
        content: req.body.content
    });
    await application.save();
    res.status(201).json({});
});

exports.createEndpoint = asyncHandler(async (req, res) => {
    const application = await Application.findOne({name: req.params.clientAppName});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    // TODO validation if function with this funciton name exists
    application.endpoints.push({
        url: req.body.url,
        functionName: req.body.functionName
    });
    await application.save();
    res.status(201).json({});
});
