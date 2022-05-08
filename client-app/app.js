const express = require('express');
const startup = require('./startup/index');
const Application = require("./models/applicationModel");

startup().then(async () => {
    const application = await Application.findOne({name: process.env.APP_NAME});
    const app = express();
    const port = 4000;
    app.use(express.json({limit: '10kb'}));

    // TODO check for version of running app
    app.get('/up', (req, res) => {
        res.status(200).json({status: 'up'});
    });

    app.post('/:endpoint', (req, res) => {
        let endpoint = application.endpoints.toObject().filter(endpoint => endpoint.url === req.params.endpoint).pop();
        if(!endpoint) {
            return res.status(404).json({message: "There is no endpoint with this url"});
        }
        let functionToRun = application.functions.toObject().filter(func => func.name === endpoint.functionName).pop();
        let call = (functionName, args) => {
            return callWithCache(functionName, args, req.body.cache, req.body.edgeResults, application.functions.toObject());
        }
        let result = {};
        try {
            result = eval(functionToRun.content)(req.body.args);
        } catch (e) {
            console.log(e);
            res.status(400).json({message: e.message});
            return;
        }
        res.status(200).json(result);
    });

    const callWithCache = (functionName, args, cache, edgeResult, functions) => {
        const calledFunction = functions.find(func => func.name === functionName);
        if(!calledFunction) {
            throw new Error(`There is no function with name=[${functionName}] that belongs to this application`);
        }
        return eval(calledFunction.content)(args);
    }

    app.listen(port, () => {
        console.log(`Client app listening on port ${port}`);
    });
});
