const {PJV} = require("package-json-validator");
const axios = require("axios");
const pickManifest = require("npm-pick-manifest");
exports.validate = async (req, res) => {
    let response = {valid: true, errors: []};
    const packageJson = req.body.code;
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
    res.status(200).json(response);
};
