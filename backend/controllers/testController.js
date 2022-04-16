const clusterService = require("../services/clusterService");
const runtimeServiceRequest = require("../models/cluster/runtimeServiceRequest");
const axios = require("axios");

exports.test = async (req, res) => {
    let appName = req.body.clientAppName;
    let appRuntimes = await clusterService.getAppRuntimes(appName);

    if (appRuntimes.length === 0) {
        res.status(422).json({message: 'runtime is not up'});
    } else {
        await clusterService.patchNamespacedService(appName, runtimeServiceRequest(appName));
    }
    let runtimeUrl = process.env.ENVIRONMENT === 'production'
        ? `http://${appName}.custom-serverless-runtime:3000`
        : process.env.RUNTIME_URL;

    axios.post(`${runtimeUrl}/test`, {
        code: req.body.code,
        args: req.body.args
    }).then(response => {
        res.status(200).json(response.data);
    }).catch(e => {
        console.log(e);
        res.status(500).json({error: e.response.data.message});
    });
};
