const express = require('express');
const startup = require('./startup/index');
const Application = require("./models/applicationModel");

startup().then(async () => {
    const application = await Application.findOne({name: process.env.APP_NAME});
    const app = express();
    const port = 4000;
    app.use(express.json({limit: '10kb'}));

    app.get('/up', (req, res) => {
        res.status(200).json({status: 'up'});
    });

    app.post('/edge', (req, res) => {
        let appFunctions = application.functions.toObject();
        let response = {runEdgeFunction: runEdgeFunction.toString(), functions: []};
        req.body.functions.forEach(functionName => {
            let requestedFunction = appFunctions.find(func => func.name === functionName);
            if (!requestedFunction) {
                return res.status(404).json({message: `There is no function with name [${functionName}]`});
            }
            response.functions.push({
                functionName: functionName,
                functionContent: requestedFunction.content
            })
        });
        res.status(200).json(response);
    });

    app.post('/:endpoint', (req, res) => {
        let endpoint = application.endpoints.toObject().filter(endpoint => endpoint.url === req.params.endpoint).pop();
        if (!endpoint) {
            return res.status(404).json({message: "There is no endpoint with this url"});
        }
        let functionToRun = application.functions.toObject().filter(func => func.name === endpoint.functionName).pop();
        let cache = req.body.cache ? req.body.cache : {};
        let edgeResults = req.body.edgeResults;
        let args = req.body.args;
        let call = (functionName, args) => {
            return callWithCache(functionName, args, cache, edgeResults, application.functions.toObject());
        }
        let result = {};
        try {
            let edgeResult = tryFromEdgeResults(functionToRun, edgeResults, args);
            if (edgeResult) {
                result = edgeResult;
            } else {
                let cacheResult = tryFromCache(functionToRun, cache, args);
                if (cacheResult) {
                    result = cacheResult;
                } else {
                    result = eval(functionToRun.content)(args);
                    if (functionToRun.idempotent) {
                        addToCache(cache, functionToRun.name, result, args);
                    }
                }
            }
        } catch (e) {
            console.log(e);
            res.status(400).json({message: e.message});
            return;
        }
        res.status(200).json({result, cache});
    });

    let runEdgeFunction = (functionName, functions, args) => {
        let edgeResults = {};
        let call = (functionName, args) => {
            let functionToCall = functions.find(func => func.functionName === functionName);
            if (!functionToCall) {
                throw new Error(`can not call unknown function: [${functionName}]`);
            }
            let result = eval(functionToCall.functionContent)(args);
            addToEdgeResults(edgeResults, functionName, result, args);
            return result;
        }

        let addToEdgeResults = (edgeResults, functionName, result, args) => {
            if (!edgeResults[functionName]) {
                edgeResults[functionName] = {};
            }
            edgeResults[functionName][Buffer.from(JSON.stringify(args)).toString('base64')] = result;
        }
        let result = call(functionName, args);
        addToEdgeResults(edgeResults, functionName, result, args);
        return edgeResults;
    };

    const addToCache = (cache, functionName, result, args) => {
        if (!cache[functionName]) {
            cache[functionName] = {};
        }
        cache[functionName][Buffer.from(JSON.stringify(args)).toString('base64')] = result;
    };

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

    const callWithCache = (functionName, args, cache, edgeResults, functions) => {
        const calledFunction = functions.find(func => func.name === functionName);
        if (!calledFunction) {
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
    };

    app.listen(port, () => {
        console.log(`Client app listening on port ${port}`);
    });
});
