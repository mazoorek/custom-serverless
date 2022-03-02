const k8s = require('@kubernetes/client-node');
const express = require('express');
const dotenv = require('dotenv');
const dns = require('dns');
const PJV = require('package-json-validator').PJV;

dotenv.config({path: './.env'});
const kc = new k8s.KubeConfig();
const PORT = 8080;
const HOST = '0.0.0.0';

let cluster;
let user;
let k8sCoreV1Api;
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
            let API_SERVER_URL = process.env.ENVIRONMENT === 'dev' ? process.env.API_SERVER_URL : `https://${address}`;

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
            k8sNetworkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);
        }
    );
});

