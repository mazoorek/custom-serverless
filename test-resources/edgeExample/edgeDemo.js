let runEdgeFunctionContent = "(functionName, functions, args) => {\n        let edgeResults = {};\n        let call = (functionName, args) => {\n            let functionToCall = functions.find(func => func.functionName === functionName);\n            if(!functionToCall) {\n                throw new Error(`can not call unknown function: [${functionName}]`);\n            }\n            let result = eval(functionToCall.functionContent)(args);\n            addToEdgeResults(edgeResults, functionName, result, args);\n            return result;\n        }\n\n        let addToEdgeResults = (edgeResults, functionName, result, args) => {\n            if(!edgeResults[functionName]) {\n                edgeResults[functionName] = {};\n            }\n            edgeResults[functionName][Buffer.from(JSON.stringify(args)).toString('base64')] = result;\n        }\n        let result =  call(functionName, args);\n        addToEdgeResults(edgeResults, functionName, result, args);\n        return edgeResults;\n    }";
let runEdgeFunction = eval(runEdgeFunctionContent);
let functions =  [
    {
        "functionName": "outer-function",
        "functionContent": "\n    (args) => {\n        let output = call(\"inner-function\",({\"a\": args.a, \"b\": args.b}));\n        return {out: output.result * args.c};\n    };\n    "
    },
    {
        "functionName": "inner-function",
        "functionContent": "    (args) => {\n        return {\"result\": args.a + args.b};\n    };  "
    }
];

let args = {
    "a": 4,
    "b": 5,
    "c": 6
};

let result = runEdgeFunction("outer-function", functions, args);
console.log(JSON.stringify(result));
