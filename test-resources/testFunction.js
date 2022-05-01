(args) => {
    let data = `
        {
        "name": "sandbox",
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
            "test": "echo \\"Error: no test specified\\" && exit 1"
        },
        "keywords": [],
        "author": "name",
        "license": "ISC",
        "dependencies": {
            "package-json-validator": "^0.6.3"
        }
        }
    `;

    let PJV=require('package-json-validator').PJV;
    let response = PJV.validate(data);
    return response;
};
