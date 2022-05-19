const axios = require("axios");

let edgeArgs = {
    "a": 4,
    "b": 5,
};

let serverlessArgs = {
    "a": 4,
    "b": 5,
    "c": 6
};

let request = {
    "functions": ["inner-function"]
};

axios.post('http://test-app.custom-serverless.com/edge', request).then(result => {
    let runEdgeFunction = eval(result.data.runEdgeFunction);
    let edgeResults = runEdgeFunction("inner-function", result.data.functions, edgeArgs);
    console.log(JSON.stringify(edgeResults));
    axios.post('http://test-app.custom-serverless.com/outer', {
        args: serverlessArgs,
        edgeResults: edgeResults
    }).then(result => {
        console.log(result.data);
    });
});
