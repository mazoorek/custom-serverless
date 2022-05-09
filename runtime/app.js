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
        let cache = req.body.cache ? req.body.cache : {};
        let edgeResults = req.body.edgeResults;
        let args = req.body.args;
        let call = (functionName, args) => {
            return callFunction(functionName, args, application.functions.toObject(), cache, edgeResults);
        }
        let result = {};
        try {
            let testedFunction = eval(req.body.code);
            result = testedFunction(args);
        } catch (e) {
            console.log(e);
            res.status(400).json({message: e.message});
            return;
        }
        res.status(200).json({result, cache});
    });

    const tryFromCache = (calledFunction, cache, args) => {
        let functionName = calledFunction.name;
        if (calledFunction.idempotent) {
            if (cache && cache[functionName]) {
                for (const cacheInput in cache[functionName]) {
                    let cacheInputObject = JSON.parse(Buffer.from(cacheInput, 'base64').toString());
                    if (deepEqual(args, cacheInputObject)) {
                        return cache[functionName][cacheInput];
                    }
                }
            }
        }
        return undefined;
    }

    const tryFromEdgeResults = (calledFunction, edgeResults, args) => {
        let functionName = calledFunction.name;
        if (edgeResults && edgeResults[functionName]) {
            for (const edgeResultInput in edgeResults[functionName]) {
                let cacheInputObject = JSON.parse(Buffer.from(edgeResultInput, 'base64').toString());
                if (deepEqual(args, cacheInputObject)) {
                    return edgeResults[functionName][edgeResultInput];
                }
            }
        }
        return undefined;
    }

    const deepEqual = (obj1, obj2) => {
        if (Object.prototype.toString.call(obj1) === Object.prototype.toString.call(obj2)) {
            if (Object.prototype.toString.call(obj1) === '[object Object]' || Object.prototype.toString.call(obj1) === '[object Array]') {
                if (Object.keys(obj1).length !== Object.keys(obj2).length) {
                    return false;
                }
                return (Object.keys(obj1).every(function (key) {
                    return deepEqual(obj1[key], obj2[key]);
                }));
            }
            return (obj1 === obj2);
        }
        return false;
    }

    const addToCache = (cache, functionName, result, args) => {
        if (!cache[functionName]) {
            cache[functionName] = {};
        }
        cache[functionName][Buffer.from(JSON.stringify(args)).toString('base64')] = result;
    };

    const callFunction = (functionName, args, functions, cache, edgeResults) => {
        const calledFunction = functions.find(func => func.name === functionName);
        if(!calledFunction) {
            throw new Error(`There is no function with name=[${functionName}] that belongs to this application`);
        }
        let edgeResult = tryFromEdgeResults(calledFunction, edgeResults, args);
        if (edgeResult) {
            return edgeResult;
        } else {
            let cacheResult = tryFromCache(calledFunction, cache, args, functionName);
            if (!cacheResult) {
                let result = eval(calledFunction.content)(args);
                if (calledFunction.idempotent) {
                    addToCache(cache, calledFunction.name, result, args);
                }
                return result;
            } else {
                return cacheResult;
            }
        }
    }

    app.listen(port, () => {
        console.log(`Runtime app listening on port ${port}`);
    });
});
