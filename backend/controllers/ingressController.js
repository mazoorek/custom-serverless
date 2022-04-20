const clusterService = require("../services/clusterService");
const ingressAppRequest = require("../models/cluster/ingressAppRequest");
const {CUSTOM_SERVERLESS_APPS} = require("../models/cluster/namespaces");
const asyncHandler = require("../utils/asyncHandler");

exports.getApps = asyncHandler(async (req, res) => {
    let ingresses = await clusterService.listNamespacedIngress(CUSTOM_SERVERLESS_APPS);
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
});

exports.createApp = asyncHandler(async (req, res) => {
    await clusterService.createNamespacedIngress(CUSTOM_SERVERLESS_APPS, ingressAppRequest(req.body.clientAppName));
    res.status(200).json({});
});
