const clusterService = require("../services/clusterService");
const ingressAppRequest = require("../models/cluster/ingressAppRequest");
const {CUSTOM_SERVERLESS_APPS} = require("../models/cluster/namespaces");
const asyncHandler = require("../utils/asyncHandler");
const Application = require('./../models/applicationModel');
const User = require("../models/userModel");

exports.getApps = asyncHandler(async (req, res) => {
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

exports.launchApp = asyncHandler(async (req, res) => {
    await clusterService.createNamespacedIngress(CUSTOM_SERVERLESS_APPS, ingressAppRequest(req.body.clientAppName));
    res.status(200).json({});
});

exports.createFunction = asyncHandler(async (req, res) => {
    const application = await Application.findOne({name: req.params.clientAppName});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    application.functions.push({
        name: req.body.name,
        content: unescape(req.body.content)
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
        functionName:  req.body.functionName
    });
    await application.save();
    res.status(201).json({});
});
