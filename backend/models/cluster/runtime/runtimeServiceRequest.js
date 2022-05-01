const moment = require("moment");
const {CUSTOM_SERVERLESS_RUNTIME} = require("../namespaces");

module.exports = (appName) => {
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
            "namespace": CUSTOM_SERVERLESS_RUNTIME
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
