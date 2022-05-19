const axios = require("axios");

let args = {
    "a": 4,
    "b": 5,
    "c": 6
};

let request = {
    "functions": ["outer-function","inner-function"]
};

axios.post('http://test-app.custom-serverless.com/edge', request).then(result => {
    let runEdgeFunction = eval(result.data.runEdgeFunction);
    let edgeResult = runEdgeFunction("outer-function", result.data.functions, args);
    console.log(JSON.stringify(edgeResult));
});
