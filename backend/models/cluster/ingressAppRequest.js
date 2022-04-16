module.exports = (appName) => {
    return {
        "apiVersion": "networking.k8s.io/v1",
        "kind": "Ingress",
        "metadata": {
            "name": appName,
            "namespace": "custom-serverless-apps"
        },
        "spec": {
            "ingressClassName": "nginx",
            "rules": [
                {
                    "host": `${appName}.custom-serverless.com`,
                    "http": {
                        "paths": [
                            {
                                "backend": {
                                    "service": {
                                        "name": "nginx-service",
                                        "port": {
                                            "number": 8080
                                        }
                                    }
                                },
                                "path": "/",
                                "pathType": "Prefix"
                            }
                        ]
                    }
                }
            ]
        }
    };
}
