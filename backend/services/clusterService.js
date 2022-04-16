const k8s = require('@kubernetes/client-node');
const dns = require("dns");
const moment = require("moment");
const kc = new k8s.KubeConfig();

let cluster;
let user;
let k8sCoreV1Api;
let k8sAppsV1Api;
let k8sNetworkingV1Api;

exports.setupClusterConnection = async () => {
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
}

exports.getAppRuntimes = (appName) => {
    return k8sCoreV1Api.listNamespacedService(
        'custom-serverless-runtime',
        undefined,
        false,
        undefined,
        `metadata.name=${appName}`
    );
}

exports.patchNamespacedService = (appName, serviceRequest) => {
    return k8sCoreV1Api.patchNamespacedService(
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

exports.createRuntimeServiceRequest = (appName) => {
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

exports.createNamespacedIngress = (namespace, ingressRequest) => {
    return k8sNetworkingV1Api.createNamespacedIngress(namespace, ingressRequest);
}

exports.listNamespacedIngress = (namespace) => {
    return k8sNetworkingV1Api.listNamespacedIngress(namespace);
}

exports.createNamespacedService = (namespace, serviceRequest) => {
    return k8sCoreV1Api.createNamespacedService(namespace, serviceRequest);
}

exports.createNamespacedDeployment = (namespace, deploymentRequest) => {
    return k8sAppsV1Api.createNamespacedDeployment(namespace, deploymentRequest);
}

exports.listRunetimeNamespacedPods = () => {
    return k8sCoreV1Api.listNamespacedPod('custom-serverless-runtime');
}

exports.monitorPodUntilRunning = (appName, callback) => {
    const informer = k8s.makeInformer(kc, '/api/v1/namespaces/custom-serverless-runtime/pods', this.listRunetimeNamespacedPods, `app=${appName}-runtime`);
    informer.on('update', (obj) => {
        console.log(`Updated: ${obj}`);
        if (obj.status.phase === 'Running') {
            console.log(`${appName} is in phase Running`);
            callback();
            informer.stop().then(_ => {
                console.log(`end watching`);
            });
        }
    });
    informer.start().then(_ => {
    });
}

exports.listRunningPods = async (appName) => {
    return await k8sCoreV1Api.listNamespacedPod(
        'custom-serverless-runtime',
        undefined,
        undefined,
        undefined,
        "status.phase=Running",
        `app=${appName}-runtime`
    );
}

exports.createRuntimeDeploymentRequest = (appName) => {
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
