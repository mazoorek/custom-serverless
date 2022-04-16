const clusterService = require("../services/clusterService");
const ingressAppRequest = require("../models/cluster/ingressAppRequest");

exports.getApps = async (req, res) => {
    let ingresses = await clusterService.listNamespacedIngress('custom-serverless-apps').catch(e => console.log(e));
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
}

exports.createApp = async (req, res) => {
    await clusterService.createNamespacedIngress('custom-serverless-apps', ingressAppRequest(req.body.clientAppName))
        .catch(e => console.log(e));
    res.status(200).json({});
}
