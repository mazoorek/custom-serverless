module.exports = (appName) => {
    // TODO wywalic tego example
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
