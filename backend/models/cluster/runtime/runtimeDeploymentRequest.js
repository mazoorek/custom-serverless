const {CUSTOM_SERVERLESS_RUNTIME} = require("../namespaces");

module.exports = (appName, packageJson) => {
    return {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {
            "labels": {
                "app": "runtime"
            },
            "name": `${appName}-runtime`,
            "namespace": CUSTOM_SERVERLESS_RUNTIME
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
                                    "value": packageJson
                                },
                                {
                                    "name": "APP_NAME",
                                    "value": `${appName}`
                                },
                                {
                                    "name": "DB_URL",
                                    "valueFrom": {
                                        "secretKeyRef": {
                                            "name": "mongodb-secret",
                                            "key": "DB_URL"
                                        }
                                    }
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
