const clusterService = require("../services/clusterService");
const clientAppIngressAppRequest = require("../models/cluster/client-app/clientAppIngressRequest");
const clientAppDeploymentRequest = require("../models/cluster/client-app/clientAppDeploymentRequest");
const clientAppServiceRequest = require("../models/cluster/client-app/clientAppServiceRequest");
const {CUSTOM_SERVERLESS_APPS, CUSTOM_SERVERLESS_RUNTIME} = require("../models/cluster/namespaces");
const asyncHandler = require("../utils/asyncHandler");
const Application = require('./../models/applicationModel');
const {PJV} = require("package-json-validator");
const axios = require("axios");
const pickManifest = require("npm-pick-manifest");

exports.getApps = asyncHandler( async  (req, res) => {
    const applications = await Application.find().select({ "name": 1, "_id": 0, "up": 1});
    res.status(200).json(applications);
});

exports.getDependencies = asyncHandler( async  (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    res.status(200).json({packageJson: application.packageJson});
});

exports.validateAndSaveDependencies = async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    const packageJson = req.body.code;
    let response = {valid: true, errors: []};
    const pjvResult = await PJV.validate(packageJson);
    if (!pjvResult.valid) {
        response = {valid: false, errors: pjvResult.errors};
    } else {
        const dependencies = JSON.parse(packageJson).dependencies;
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
    if(response.errors.length === 0) {
        application.packageJson = packageJson;
        await application.save();
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
    await stopApp(appName);
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
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    const resultFunction = application.functions.toObject().find(func => func.name === functionName);
    if(!resultFunction) {
        return res.status(404).json({message: "There is no function with this name that belongs to this application"});
    }
    res.status(200).json(resultFunction);
});

exports.editFunction = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    let functionName = req.params.functionName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    let functions = application.functions.toObject();
    const resultFunction = functions.find(func => func.name === functionName);
    if(!resultFunction) {
        return res.status(404).json({message: "There is no function with this name that belongs to this application"});
    }
    if(req.body.name) {
        resultFunction.name = req.body.name;
    }
    if(req.body.idempotent) {
        resultFunction.idempotent = req.body.idempotent;
    }
    if(req.body.content) {
       // TODO checking content structure regex
        // TODO checking require
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
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.name = req.body.newAppName;
    await application.save();
    res.status(200).json();
});

exports.start = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.up = true;
    await application.save();
    await clusterService.createNamespacedService(CUSTOM_SERVERLESS_APPS, clientAppServiceRequest(appName));
    await clusterService.createNamespacedDeployment(CUSTOM_SERVERLESS_APPS, clientAppDeploymentRequest(appName, application.packageJson));
    // TODO add label with app version to ingress
    await clusterService.createNamespacedIngress(CUSTOM_SERVERLESS_APPS, clientAppIngressAppRequest(appName));
    res.status(200).json({});
});

exports.stop = asyncHandler(async (req, res) => {
    let appName = req.params.clientAppName;
    const application = await Application.findOne({name: appName, user: req.user.id});
    if(!application) {
        return res.status(404).json({message: "There is no application with this name that belongs to this user"});
    }
    application.up = false;
    await application.save();
    await stopApp(appName);
    res.status(200).json({});
});

const stopApp = async (appName) => {
    await clusterService.deleteNamespacedIngress(appName, CUSTOM_SERVERLESS_APPS);
    await clusterService.deleteNamespacedService(appName, CUSTOM_SERVERLESS_APPS);
    await clusterService.deleteNamespacedDeployment(appName, CUSTOM_SERVERLESS_APPS);
}

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
    // TODO validation if function with this funciton name exists
    application.endpoints.push({
        url: req.body.url,
        functionName: req.body.functionName
    });
    await application.save();
    res.status(201).json({});
});
