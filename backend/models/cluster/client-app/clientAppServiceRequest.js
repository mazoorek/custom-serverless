const {CUSTOM_SERVERLESS_APPS} = require("../namespaces");

module.exports = (appName) => {
    return {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "labels": {
                "app": "apps"
            },
            "name": `${appName}`,
            "namespace": CUSTOM_SERVERLESS_APPS
        },
        "spec": {
            "ports": [
                {
                    "port": 4000,
                    "protocol": "TCP",
                    "targetPort": 4000
                }
            ],
            "selector": {
                "app": `${appName}`
            }
        }
    };
}
