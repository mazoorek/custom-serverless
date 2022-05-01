const {PJV} = require("package-json-validator");
const axios = require("axios");
const pickManifest = require("npm-pick-manifest");
const Application = require("../models/applicationModel");
exports.dependencies = async (req, res) => {
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
    application.packageJson = packageJson;
    await application.save();
    res.status(200).json(response);
};
