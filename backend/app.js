const k8s = require('@kubernetes/client-node');

// const cluster = {
//     name: 'my-server',
//     server: 'https://server.com',
// };
//
// const user = {
//     name: 'my-user',
//     password: 'some-password',
// };
//
// const context = {
//     name: 'my-context',
//     user: user.name,
//     cluster: cluster.name,
// };
//
// const kc = new k8s.KubeConfig();
// kc.loadFromOptions({
//     clusters: [cluster],
//     users: [user],
//     contexts: [context],
//     currentContext: context.name,
// });
// const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const kc = new k8s.KubeConfig();

const cluster = {
    name: 'api-server',
    server: 'https://3.67.83.25:6443',
    skipTLSVerify: true
};

const user = {
    token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6InJRdFhMdFdRV0VHaklwZ3ZRWlBza04tY3hfOXNGM0FoVnBkS0ZnclBkQlEifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImJhY2tlbmQtdG9rZW4tZDloNXYiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiYmFja2VuZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImNkODU0MDNmLTBkNjMtNGM1OS1hYzQ1LTljMDYwNjA1ZjlhOSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmJhY2tlbmQifQ.RauJqCNS62-g6XrYxgQSs0ItYl6ArsD12LOp5Eg0nfIEmz9_J-hTo8bBQDw_QJdRATwUybblCIPqR6XQqWGprXmjgiwKj1IAMw9jg7B-_5ZtL6WxihVtzt_Rz5N5oJV_6mcBqo6SHRwQCbLsuNIikO-cVIysiOJsdof1d5s2N8CLK5E3ByNJZTa89p-9eKeqeMvdzfHg-Q5K2B8yQmYOc0R7kz2cAqRI0r4ILmoemAt6d0CgYYh4rI1CwnbGMHdfiegBllqAcBhYYMnToIunrbRifyrSdNAC7MqDjcLLWST10EiGSshmm72rsTYV5PzH3qwdFHhNBIXKJ98keerrfg'
};

kc.loadFromClusterAndUser(cluster, user);

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

k8sApi.listNamespacedPod('default').then((res) => {
    console.log(res.body);
});

