const k8s = require('@kubernetes/client-node');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const kc = new k8s.KubeConfig();

const cluster = {
    name: 'k8s-server',
    server: process.env.API_SERVER_URL,
    skipTLSVerify: true
};

const user = {
    token: process.env.TOKEN
};

kc.loadFromClusterAndUser(cluster, user);

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

k8sApi.listNamespacedPod('default').then((res) => {
    console.log(res.body);
});

