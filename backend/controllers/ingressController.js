const clusterService = require("../services/clusterService");
const ingressAppRequest = require("../models/cluster/ingressAppRequest");
const {CUSTOM_SERVERLESS_APPS} = require("../models/cluster/namespaces");

exports.getApps = async (req, res) => {
    let ingresses = await clusterService.listNamespacedIngress(CUSTOM_SERVERLESS_APPS).catch(e => console.log(e));
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
}

exports.createApp = async (req, res) => {
    await clusterService.createNamespacedIngress(CUSTOM_SERVERLESS_APPS, ingressAppRequest(req.body.clientAppName))
        .catch(e => console.log(e));
    res.status(200).json({});
}
