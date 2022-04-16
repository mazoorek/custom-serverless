const express = require('express');
const clusterService = require('../services/clusterService');
const router = express.Router({mergeParams: true});

router.get('/', async (req, res) => {
    let ingresses = await clusterService.listNamespacedIngress('custom-serverless-apps').catch(e => console.log(e));
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
});

router.post('/', async (req, res) => {
    let appName = req.body.clientAppName;
    let ingressRequest = {
        "apiVersion": "networking.k8s.io/v1",
        "kind": "Ingress",
        "metadata": {
            "name": appName,
            "namespace": "custom-serverless-apps"
        },
        "spec": {
            "ingressClassName": "nginx",
            "rules": [
                {
                    "host": `${appName}.custom-serverless.com`,
                    "http": {
                        "paths": [
                            {
                                "backend": {
                                    "service": {
                                        "name": "nginx-service",
                                        "port": {
                                            "number": 8080
                                        }
                                    }
                                },
                                "path": "/",
                                "pathType": "Prefix"
                            }
                        ]
                    }
                }
            ]
        }
    };
    await clusterService.createNamespacedIngress('custom-serverless-apps', ingressRequest).catch(e => console.log(e));
    res.status(200).json({});
});

module.exports = router;
