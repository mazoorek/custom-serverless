const k8s = require('@kubernetes/client-node');
const express = require('express');
const dotenv = require('dotenv');
const dns = require('dns');

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


app.get('/ingresses', async (req, res) => {
    let ingresses = await k8sNetworkingV1Api.listNamespacedIngress('custom-serverless-apps').catch(e => console.log(e));
    res.json(ingresses);
});

app.post('/create', async (req, res) => {
    let ingressRequest = {
        "apiVersion": "networking.k8s.io/v1",
        "kind": "Ingress",
        "metadata": {
            "annotations": {
                "kubernetes.io/ingress.class": "nginx",
                "nginx.ingress.kubernetes.io/rewrite-target": "/"
            },
            "name": "lb-ingress",
            "namespace": "custom-serverless-apps"
        },
        "spec": {
            "rules": [
                {
                    "host": "terraform-example-alb-352318663.eu-central-1.elb.amazonaws.com",
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
                                "pathType": "Exact"
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

