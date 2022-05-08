const k8s = require('@kubernetes/client-node');
const dns = require("dns");
const {CUSTOM_SERVERLESS_RUNTIME} = require("../models/cluster/namespaces");
const axios = require("axios");
const kc = new k8s.KubeConfig();

let cluster;
let user;
let k8sCoreV1Api;
let k8sAppsV1Api;
let k8sNetworkingV1Api;

exports.setupClusterConnection = async () => {
    await dns.lookup(process.env.API_SERVER_URL, (err, address, _) => {
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
        CUSTOM_SERVERLESS_RUNTIME,
        undefined,
        false,
        undefined,
        `metadata.name=${appName}`
    );
}

exports.listNamespacedService = (namespace) => {
    return k8sCoreV1Api.listNamespacedService(namespace);
}

exports.deleteNamespacedService = (name, namespace) => {
    return k8sCoreV1Api.deleteNamespacedService(name, namespace);
}

exports.deleteNamespacedDeployment = (name, namespace) => {
    return k8sAppsV1Api.deleteNamespacedDeployment(name, namespace);
}

exports.deleteNamespacedIngress = (name, namespace) => {
    return k8sNetworkingV1Api.deleteNamespacedIngress(name, namespace);
}

exports.patchNamespacedService = (appName, serviceRequest) => {
    return k8sCoreV1Api.patchNamespacedService(
        appName,
        CUSTOM_SERVERLESS_RUNTIME,
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

exports.createNamespacedIngress = (namespace, ingressRequest) => {
    return k8sNetworkingV1Api.createNamespacedIngress(namespace, ingressRequest);
}

exports.listNamespacedIngress = (namespace) => {
    return k8sNetworkingV1Api.listNamespacedIngress(namespace);
}

exports.createNamespacedService = (namespace, serviceRequest) => {
    return k8sCoreV1Api.createNamespacedService(namespace, serviceRequest);
}

exports.restartNamespacedDeployment = async (appName, namespace, deploymentRequest) => {
    await this.deleteNamespacedDeployment(appName, namespace);
    await this.createNamespacedDeployment(namespace, deploymentRequest);
};

exports.createNamespacedDeployment = (namespace, deploymentRequest) => {
    return k8sAppsV1Api.createNamespacedDeployment(namespace, deploymentRequest);
}

exports.listRuntimeNamespacedPods = () => {
    return k8sCoreV1Api.listNamespacedPod(CUSTOM_SERVERLESS_RUNTIME);
}

const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.monitorPodUntilRunning = (appName, callback, errorCallback) => {
    console.log(`creating informer to monitor appName: ${appName}`);
    const informer = k8s.makeInformer(
        kc,
        `/api/v1/namespaces/${CUSTOM_SERVERLESS_RUNTIME}/pods`,
        this.listRuntimeNamespacedPods,
        `app=${appName}-runtime`
    );
    informer.on('update', async (obj) => {
        console.log(`Updated: ${appName}`);
        if (obj.status.phase === 'Running') {
            console.log(`${appName} Pod is in phase Running`);
            console.log(`check if runtime-app: [${appName}] is up...`);
            let runtimeUrl = process.env.ENVIRONMENT === 'production'
                ? `http://${appName}.${CUSTOM_SERVERLESS_RUNTIME}:3000`
                : process.env.RUNTIME_URL;
            const maxNumberOfHealthChecks = 5;
            for (let i = 1; i <= maxNumberOfHealthChecks; i++) {
                await wait(2000);
                console.log(`attempt nr ${i} to reach runtime`);
                try {
                    await axios.get(`${runtimeUrl}/up`);
                    console.log(`runtime for app: [${appName}] is up, sending notification to frontend`);
                    callback();
                    informer.stop().then(_ => {
                        console.log(`end watching`);
                    });
                    break;
                } catch (e) {
                    console.log(`error in reaching ${appName} runtime, error: ${e}`);
                    if(i === maxNumberOfHealthChecks) {
                        errorCallback();
                    }
                }
            }
        }
    });
    informer.start().then(_ => {
        }
    );
}

exports.listRunningPods = async (appName) => {
    return await k8sCoreV1Api.listNamespacedPod(
        CUSTOM_SERVERLESS_RUNTIME,
        undefined,
        undefined,
        undefined,
        "status.phase=Running",
        `app=${appName}-runtime`
    );
}
