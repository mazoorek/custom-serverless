const express = require('express');
const axios = require("axios");
const clusterService = require('../services/clusterService');
const router = express.Router({mergeParams: true});


// async function getAppRuntimes(appName) {
//     return (await k8sCoreV1Api.listNamespacedService(
//             'custom-serverless-runtime',
//             undefined,
//             false,
//             undefined,
//             `metadata.name=${appName}`
//         ).catch(e => console.log(e))
//     ).body.items;
// }

router.post('/', async (req, res) => {
    let appName = req.body.clientAppName;
    let appRuntimes = await clusterService.getAppRuntimes(appName);

    if (appRuntimes.length === 0) {
        res.status(422).json({message: 'runtime is not up'});
    } else {
        let serviceRequest = clusterService.createRuntimeServiceRequest(appName);
        await clusterService.patchNamespacedService(appName, serviceRequest);
        // await k8sCoreV1Api.patchNamespacedService(
        //     appName,
        //     'custom-serverless-runtime',
        //     serviceRequest,
        //     undefined,
        //     undefined,
        //     undefined,
        //     undefined,
        //     {
        //         headers: {
        //             "Content-Type": "application/strategic-merge-patch+json"
        //         }
        //     }
        // ).catch(e => console.log(e));
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
});

module.exports = router;
