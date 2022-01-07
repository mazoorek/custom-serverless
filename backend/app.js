const k8s = require('@kubernetes/client-node');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
const kc = new k8s.KubeConfig();
const PORT = 8080;
const HOST = '0.0.0.0';

const cluster = {
    name: 'k8s-server',
    server: process.env.API_SERVER_URL,
    skipTLSVerify: true
};

const user = {
    token: process.env.TOKEN
};

kc.loadFromClusterAndUser(cluster, user);

const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const k8sNetworkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);

const app = express();

app.use(express.json({limit: '10kb'}));

app.get('/pods', async (req, res) => {
    let pods = await k8sCoreV1Api.listNamespacedPod('custom-serverless-apps').catch(e => console.log(e));
    res.json(pods);
});

app.get('/pods-runtime', async (req, res) => {
    let pods = await k8sCoreV1Api.listNamespacedPod('custom-serverless-runtime').catch(e => console.log(e));
    res.json(pods);
});


app.get('/ingresses', async (req, res) => {
    let ingresses = await k8sNetworkingV1Api.listNamespacedIngress('custom-serverless-apps', true).catch(e => console.log(e));
    res.json(ingresses);
});

app.get('/ingresses-default', async (req, res) => {
    let ingresses = await k8sNetworkingV1Api.listNamespacedIngress('default', true).catch(e => console.log(e));
    res.json(ingresses);
});

// app.post('/create', async (req, res) => {
//     await k8sNetworkingV1Api.createNamespacedIngress('default', {
//         apiVersions: 'networking.k8s.io/v1beta1',
//         kind: 'Ingress',
//         metadata: { name: `production-custom-${clientIdentifier}` },
//         spec: {
//             rules: [{
//                 host: `${clientIdentifier}.example.com`,
//                 http: {
//                     paths: [{
//                         backend: {
//                             serviceName: 'production-auto-deploy',
//                             servicePort: 5000
//                         },
//                         path: '/'
//                     }]
//                 }
//             }],
//             tls: [{ hosts: [`${clientIdentifier}.example.com`] }]
//         }
//     }).catch(e => console.log(e))
// });

app.listen(PORT, HOST,  () => {
    console.log(`Running on port ${PORT}`);
});

