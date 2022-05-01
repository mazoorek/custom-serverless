const {CUSTOM_SERVERLESS_APPS} = require("../namespaces");

module.exports = (appName, packageJson) => {
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
      "mongoose": "^6.3.0",
      "dotenv": "^10.0.0",
      "package-json-validator": "^0.6.3"
    }
  }
  `;
    return {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {
            "labels": {
                "app": `${appName}`
            },
            "name": `${appName}`,
            "namespace": CUSTOM_SERVERLESS_APPS
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "app": `${appName}`
                }
            },
            "template": {
                "metadata": {
                    "labels": {
                        "app": `${appName}`
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
                            "image": "444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-apps:latest",
                            "imagePullPolicy": "Always",
                            "name": `${appName}`
                        }
                    ],
                    "imagePullSecrets": [
                        {
                            "name": "apps-ecr-secret"
                        }
                    ]
                }
            }
        }
    };
};
