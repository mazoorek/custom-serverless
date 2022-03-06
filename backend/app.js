const k8s = require('@kubernetes/client-node');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const dns = require('dns');
const moment = require("moment");
const PJV = require('package-json-validator').PJV;

dotenv.config({path: './.env'});
const kc = new k8s.KubeConfig();
const PORT = 8080;
const HOST = '0.0.0.0';

let cluster;
let user;
let k8sCoreV1Api;
let k8sAppsV1Api;
let k8sNetworkingV1Api;

const app = express();

app.use(express.json({limit: '10kb'}));

app.get('/pods', async (req, res) => {
    let pods = await k8sCoreV1Api.listNamespacedPod('custom-serverless-apps', true).catch(e => console.log(e));
    res.json(pods);
});

app.get('/pods-runtime', async (req, res) => {
    let pods = await k8sCoreV1Api.listNamespacedPod('custom-serverless-runtime').catch(e => console.log(e));
    res.json(pods);
});


app.get('/api/ingress', async (req, res) => {
    let ingresses = await k8sNetworkingV1Api.listNamespacedIngress('custom-serverless-apps').catch(e => console.log(e));
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
});

app.post('/api/validate', async (req, res) => {
    let response = PJV.validate(req.body.code);
    res.json(response);
});

app.post('/api/test', async (req, res) => {
    let appName = req.body.clientAppName;
    let appRuntimes = (await k8sCoreV1Api.listNamespacedService(
            'custom-serverless-runtime',
            undefined,
            false,
            undefined,
            `metadata.name=${appName}`
        ).catch(e => console.log(e))
    ).body.items;

    let exampleValidPackageJson = `
   {
    "name": "sandbox",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \\"Error: no test specified\\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {
      "express": "^4.17.3",
      "package-json-validator": "^0.6.3"
    }
  }
  `;

    let expirationDate = moment(new Date()).add(5, 'm').toDate();
    let serviceRequest = {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "labels": {
                "app": "runtime",
                "expire": `${expirationDate.getTime()}`
            },
            "name": `${appName}`,
            "namespace": "custom-serverless-runtime"
        },
        "spec": {
            "ports": [
                {
                    "port": 3000,
                    "protocol": "TCP",
                    "targetPort": 3000
                }
            ],
            "selector": {
                "app": `${appName}-runtime`
            }
        }
    };

    let deploymentRequest = {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {
            "labels": {
                "app": "runtime"
            },
            "name": `${appName}-runtime`,
            "namespace": "custom-serverless-runtime"
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "app": `${appName}-runtime`
                }
            },
            "template": {
                "metadata": {
                    "labels": {
                        "app": `${appName}-runtime`
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "env": [
                                {
                                    "name": "PACKAGE_JSON",
                                    "value": exampleValidPackageJson
                                }
                            ],
                            "image": "444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-runtime:latest",
                            "imagePullPolicy": "Always",
                            "name": "runtime"
                        }
                    ],
                    "imagePullSecrets": [
                        {
                            "name": "runtime-ecr-secret"
                        }
                    ]
                }
            }
        }
    };

    if (appRuntimes.length === 0) {
        await k8sCoreV1Api.createNamespacedService('custom-serverless-runtime', serviceRequest).catch(e => console.log(e));
        await k8sAppsV1Api.createNamespacedDeployment('custom-serverless-runtime', deploymentRequest).catch(e => console.log(e));
    } else {
        await k8sCoreV1Api.patchNamespacedService(
            appName,
            'custom-serverless-runtime',
            serviceRequest,
            undefined,
            undefined,
            undefined,
            undefined,
            {
                headers: {
                    "Content-Type": "application/strategic-merge-patch+json"
                }
            }
        ).catch(e => console.log(e));
    }
    let runtimeUrl = process.env.ENVIRONMENT === 'production'
        ? `http://${appName}.custom-serverless-runtime:3000`
        : process.env.RUNTIME_URL;
    let response = await axios.post(`${runtimeUrl}/test`, {
        code: req.body.code,
        args: req.body.args
    }).catch(e => console.log(e));
    res.status(200).json(response.data);
});

app.post('/api/ingress', async (req, res) => {
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
    await k8sNetworkingV1Api.createNamespacedIngress('custom-serverless-apps', ingressRequest).catch(e => console.log(e));
    res.status(200).json({});
});

app.listen(PORT, HOST, async () => {
    console.log(`Running on port ${PORT}`);
    await dns.lookup(process.env.API_SERVER_URL, (err, address, family) => {
            let API_SERVER_URL = process.env.ENVIRONMENT === 'production' ? `https://${address}` : process.env.API_SERVER_URL;

            cluster = {
                name: 'k8s-server',
                server: API_SERVER_URL,
                skipTLSVerify: true
            };

            user = {
                token: process.env.TOKEN
            };

            kc.loadFromClusterAndUser(cluster, user);

            k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
            k8sAppsV1Api = kc.makeApiClient(k8s.AppsV1Api);
            k8sNetworkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);
        }
    );
});

