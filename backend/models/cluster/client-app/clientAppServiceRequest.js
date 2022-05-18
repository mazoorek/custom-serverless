const {CUSTOM_SERVERLESS_APPS} = require("../namespaces");

module.exports = (application) => {
    return {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "labels": {
                "app": "apps",
                "version": `${application.__v}`
            },
            "name": `${application.name}`,
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
                "app": `${application.name}`
            }
        }
    };
}
