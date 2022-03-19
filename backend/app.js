const k8s = require('@kubernetes/client-node');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const dns = require('dns');
const ws = require('ws');
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
const watch = new k8s.Watch(kc);

const app = express();

app.use(express.json({limit: '10kb'}));

app.get('/api/ingress', async (req, res) => {
    let ingresses = await k8sNetworkingV1Api.listNamespacedIngress('custom-serverless-apps').catch(e => console.log(e));
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
});

app.post('/api/validate', async (req, res) => {
    let response = PJV.validate(req.body.code);
    res.json(response);
});

let createRuntimeServiceRequest = (appName) => {
    let expirationDate = moment(new Date()).add(5, 'm').toDate();
    return {
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
}

let createRuntimeDeploymentRequest = (appName) => {
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

    return {
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
}

async function getAppRuntimes(appName) {
    return (await k8sCoreV1Api.listNamespacedService(
            'custom-serverless-runtime',
            undefined,
            false,
            undefined,
            `metadata.name=${appName}`
        ).catch(e => console.log(e))
    ).body.items;
}

app.get('/api/runtime/:clientAppName', async (req, res) => {
    // TODO validation if clientAppName belongs to client
    let appName = req.params.clientAppName;
    let appRuntimes = await getAppRuntimes(appName);
    let runtimeReady = true;
    if (appRuntimes.length === 0) {
        runtimeReady = false;
        let serviceRequest = createRuntimeServiceRequest(appName);
        let deploymentRequest = createRuntimeDeploymentRequest(appName);
        await k8sCoreV1Api.createNamespacedService('custom-serverless-runtime', serviceRequest).catch(e => console.log(e));
        await k8sAppsV1Api.createNamespacedDeployment('custom-serverless-runtime', deploymentRequest).catch(e => console.log(e));
        // watch.watch(
        //     '/api/v1/namespaces/custom-serverless-runtime/pods',
        //     {
        //         labelSelector: encodeURI(`app=${appName}-runtime`)
        //     },
        //     (phase, apiObj, watchObj) => {
        //         console.log(`faza: ${phase}`);
        //         console.log(watchObj.object.status.phase);
        //         if (phase === 'MODIFIED') {
        //             if(watchObj.object.status.phase === 'Running') {
        //                 console.log('faza running');
        //                 this._stop();
        //             }
        //
        //         }
        //     },
        //     (err) => {
        //         console.log(`done with watching ${err}`);
        //     }
        // ).then(value => {
        //     console.log(`koniec: ${value}`);
        // });

        const listFn = () => k8sCoreV1Api.listNamespacedPod('custom-serverless-runtime');
        const informer = k8s.makeInformer(kc, '/api/v1/namespaces/custom-serverless-runtime/pods', listFn, `app=${appName}-runtime`);
        informer.on('update', (obj) => {
            console.log(`Updated: ${obj}`);
            if(obj.status.phase === 'Running') {
                console.log('faza running');
                informer.stop().then(result => {
                    console.log(`koniec: ${result}`);
                });
            }
        });
        await informer.start();


    } else {
        let numberOfRunningPods = (await k8sCoreV1Api.listNamespacedPod(
            'custom-serverless-runtime',
            undefined,
            undefined,
            undefined,
            "status.phase=Running",
            `app=${appName}-runtime`
        ).catch(e => console.log(e))).body.items.length;
        if (numberOfRunningPods === 0) {
            runtimeReady = false;
        }
    }
    res.status(200).json({runtimeReady: runtimeReady});
});

app.post('/api/test', async (req, res) => {
    let appName = req.body.clientAppName;
    let appRuntimes = await getAppRuntimes(appName);

    if (appRuntimes.length === 0) {
        res.status(422).json({message: 'runtime is not up'});
    } else {
        let serviceRequest = createRuntimeServiceRequest(appName);
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

const server = app.listen(PORT, HOST, async () => {
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

const wsServer = new ws.Server({noServer: true});

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        // TODO ws authentication
        // var validationResult = validateCookie(req.headers.cookie);
        // if (validationResult) {
        //     //...
        // } else {
        //     socket.write('HTTP/1.1 401 Web Socket Protocol Handshake\r\n' +
        //         'Upgrade: WebSocket\r\n' +
        //         'Connection: Upgrade\r\n' +
        //         '\r\n');
        //     socket.close();
        //     socket.destroy();
        //     return;
        // }
        // //...
        wsServer.emit('connection', socket, request);
    });
});

wsServer.on('connection', socket => {
    socket.on('message', async appName => {
        watch.watch(
            '/api/v1/namespaces/custom-serverless-runtime/pods',
            {
                labelSelector: encodeURI(`app=${appName}-runtime`)
            },
            (phase, apiObj, watchObj) => {
                if (phase === 'Running') {
                    socket.send("ready");
                }
            },
            (err) => {
                console.log(`done with watching ${err}`);
            }
        ).then(result => console.log(result));
        console.log('koniec');
    });
});

