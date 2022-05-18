const clusterService = require("../services/clusterService");
const applicationsService = require("../services/applicationsService");
const clientAppIngressAppRequest = require("../models/cluster/client-app/clientAppIngressRequest");
const clientAppDeploymentRequest = require("../models/cluster/client-app/clientAppDeploymentRequest");
const clientAppServiceRequest = require("../models/cluster/client-app/clientAppServiceRequest");
const {CUSTOM_SERVERLESS_APPS, CUSTOM_SERVERLESS_RUNTIME} = require("../models/cluster/namespaces");
const asyncHandler = require("../utils/asyncHandler");
const Application = require('./../models/applicationModel');
const {PJV} = require("package-json-validator");
const axios = require("axios");
const pickManifest = require("npm-pick-manifest");
const runtimeDeploymentRequest = require("../models/cluster/runtime/runtimeDeploymentRequest");

exports.getApps = asyncHandler(async (req, res) => {
    const applications = await Application.find({user: req.user.id}).select({"name": 1, "_id": 0, "up": 1, "__v": 1});
    const runningApps = await clusterService.listNamespacedService(CUSTOM_SERVERLESS_APPS);
    result = applications.map(application => {
        application = application.toObject();
        if(application.up) {
            const runningApp = runningApps.body.items.find(item => item.metadata.name === application.name );
            if(+runningApp.metadata.labels.version < +application.__v) {
                application.outdated = true;
            }
        } else {
            application.outdated = false;
        }
        return application;
    });
    res.status(200).json(result);
});

exports.getDependencies = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    res.status(200).json({packageJson: application.packageJson});
});

requiredDependenciesNotPresent = (dependencies) => {
    return !dependencies.express
        || dependencies.express !== "^4.17.3"
        || !dependencies.mongoose
        || dependencies.mongoose !== "^6.3.0"
        || !dependencies.dotenv
        || dependencies.dotenv !== "^10.0.0"
}

exports.validateAndSaveDependencies = async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    const packageJson = req.body.code;
    let response = {valid: true, errors: []};
    const pjvResult = await PJV.validate(packageJson);
    if (!pjvResult.valid) {
        response = {valid: false, errors: pjvResult.errors};
    } else {
        const dependencies = JSON.parse(packageJson).dependencies;
        if (requiredDependenciesNotPresent(dependencies)) {
            response = {
                valid: false,
                errors: [...response.errors, `missing one of required dependencies with required versions: 
                {"express": "^4.17.3","mongoose": "^6.3.0","dotenv": "^10.0.0","package-json-validator": "^0.6.3"}`
                ]
            };
        }
        for (const dependency in dependencies) {
            const dependencyVersion = dependencies[dependency];
            try {
                const packument = await axios.get(`https://registry.npmjs.org/${dependency}`);
                try {
                    pickManifest(packument.data, dependencyVersion);
                } catch (e) {
                    response = {
                        valid: false,
                        errors: [...response.errors, `version '${dependencyVersion}' for dependency '${dependency}' not found`]
                    };
                }
            } catch (e) {
                response = {valid: false, errors: [...response.errors, `dependency '${dependency}' not found`]};
            }
        }
    }
    if (response.errors.length === 0) {
        application.packageJson = packageJson;
        application.__v += 1;
        await application.save();
        let numberOfRunningPods = (await clusterService.listRunningPods(appName)).body.items.length;
        if (numberOfRunningPods > 0) {
            await clusterService.restartNamespacedDeployment(
                `${appName}-runtime`,
                CUSTOM_SERVERLESS_RUNTIME,
                runtimeDeploymentRequest(appName, application.packageJson)
            );
        }
    }
    res.status(200).json(response);
};

exports.getRunningApps = asyncHandler(async (req, res) => {
    let ingresses = await clusterService.listNamespacedIngress(CUSTOM_SERVERLESS_APPS);
    let response = ingresses.body.items.map(item => item.metadata.name);
    res.json(response);
});

exports.createApp = asyncHandler(async (req, res) => {
    await Application.create({
        name: req.body.clientAppName,
        user: req.user.id
    });
    res.status(201).json({});
});

exports.deleteApp = asyncHandler(async (req, res) => {
    const appName = req.params.clientAppName;
    const runningApps = await clusterService.listNamespacedService(CUSTOM_SERVERLESS_APPS);
    if (runningApps.body.items.find(item => item.metadata.name === appName )) {
        await applicationsService.stopApp(appName);
    }
    await Application.deleteOne({
        name: appName,
        user: req.user.id
    });
    res.status(200).json({});
});

exports.getApp = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    res.status(200).json(application);
});

exports.getFunction = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    let functionName = req.params.functionName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    const resultFunction = application.functions.toObject().find(func => func.name === functionName);
    if (!resultFunction) {
        return res.status(404).json({message: "There is no function with this name that belongs to this application"});
    }
    res.status(200).json(resultFunction);
});

exports.getEndpoint = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    let endpointUrl = req.params.endpointUrl;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    const resultEndpoint = application.endpoints.toObject().find(endpoint => endpoint.url === endpointUrl);
    if (!resultEndpoint) {
        return res.status(404).json({message: "There is no function with this name that belongs to this application"});
    }
    res.status(200).json(resultEndpoint);
});

exports.editFunction = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    let functionName = req.params.functionName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    let functions = application.functions.toObject();
    const resultFunction = functions.find(func => func.name === functionName);
    if (!resultFunction) {
        return res.status(404).json({message: "There is no function with this name that belongs to this application"});
    }
    if (req.body.name) {
        resultFunction.name = req.body.name;
    }
    if (req.body.idempotent) {
        resultFunction.idempotent = req.body.idempotent;
    }
    if (req.body.content) {
        resultFunction.content = req.body.content;
    }
    const resultFunctionIndex = functions.findIndex(func => func.name === functionName);
    functions[resultFunctionIndex] = resultFunction;
    application.functions = functions;
    await application.save();
    res.status(200).json();
});

exports.editAppName = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.name = req.body.newAppName;
    await application.save();
    const runningApps = await clusterService.listNamespacedService(CUSTOM_SERVERLESS_APPS);
    if (runningApps.body.items.find(item => item.metadata.name === appName )) {
        await applicationsService.stopApp(appName);
        await applicationsService.startApp(application);
    }
    res.status(200).json();
});

exports.start = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.up = true;
    await application.save();
    await applicationsService.startApp(application);
    res.status(200).json({});
});

exports.stop = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.up = false;
    await application.save();
    await applicationsService.stopApp(appName);
    res.status(200).json({});
});

exports.createFunction = asyncHandler(async (req, res) => {
    const application = await Application.findOne({name: req.params.clientAppName});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    application.functions.push({
        name: req.body.name,
        content: !!req.body.content ? req.body.content : application.defaultFunctionContent()
    });
    await application.save();
    res.status(201).json({});
});

exports.createEndpoint = asyncHandler(async (req, res) => {
    const application = await Application.findOne({name: req.params.clientAppName});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    application.endpoints.push({
        url: req.body.url,
        functionName: req.body.functionName
    });
    await application.save();
    res.status(201).json({});
});

exports.editEndpoint = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    let endpointUrl = req.params.endpointUrl;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    let endpoints = application.endpoints.toObject();
    const resultEndpoint = endpoints.find(endpoint => endpoint.url === endpointUrl);
    if (!resultEndpoint) {
        return res.status(404).json({message: "There is no endpoint with this url that belongs to this application"});
    }

    resultEndpoint.url = req.body.url;
    resultEndpoint.functionName = req.body.functionName;

    const resultEndpointIndex = endpoints.findIndex(endpoint => endpoint.url === endpointUrl);
    endpoints[resultEndpointIndex] = resultEndpoint;
    application.endpoints = endpoints;
    await application.save();
    res.status(200).json();
});

exports.deleteEndpoint = asyncHandler(async (req, res) => {
    const application = await Application.findOne({
        name: req.params.clientAppName,
        user: req.user.id
    });
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    application.endpoints = application.endpoints.toObject().filter(endpoint => endpoint.url !== req.params.endpointUrl);
    await application.save();
    res.status(200).json({});
});

exports.deleteFunction = asyncHandler(async (req, res) => {
    const application = await Application.findOne({
        name: req.params.clientAppName,
        user: req.user.id
    });
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    application.functions = application.functions.toObject().filter(func => func.name !== req.params.functionName);
    await application.save();
    res.status(200).json({});
});

exports.createEndpoint = asyncHandler(async (req, res) => {
    const application = await Application.findOne({name: req.params.clientAppName});
    if (!application) {
        return res.status(404).json({message: "There is no application with this name"});
    }
    const appFunction = application.functions.toObject().find(func => func.name === req.body.functionName);
    if (!appFunction) {
        return res.status(404).json({message: "There is no function with this name"});
    }
    application.endpoints.push({
        url: req.body.url,
        functionName: req.body.functionName
    });
    await application.save();
    res.status(201).json({});
});
