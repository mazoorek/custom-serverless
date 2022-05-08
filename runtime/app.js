const express = require('express');
const startup = require('./startup/index');
const Application = require("./models/applicationModel");

startup().then(async () => {
    const app = express();
    const port = 3000;
    app.use(express.json({limit: '10kb'}));

    app.get('/up', (req, res) => {
        res.status(200).json({status: 'up'});
    });

    app.post('/test', async (req, res) => {
        const application = await Application.findOne({name: process.env.APP_NAME});
        let call = (functionName, args) => {
            return callFunction(functionName, args, application.functions.toObject());
        }
        let result = {};
        try {
            let testedFunction = eval(req.body.code);
            result = testedFunction(req.body.args);
        } catch (e) {
            console.log(e);
            res.status(400).json({message: e.message});
            return;
        }
        res.status(200).json(result);
    });

    const callFunction = (functionName, args, functions) => {
        const calledFunction = functions.find(func => func.name === functionName);
        if(!calledFunction) {
            throw new Error(`There is no function with name=[${functionName}] that belongs to this application`);
        }
        return eval(calledFunction.content)(args);
    }

    app.listen(port, () => {
        console.log(`Runtime app listening on port ${port}`);
    });
});
