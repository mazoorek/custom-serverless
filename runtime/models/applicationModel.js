const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Please provide application name'],
        unique: true
    },
    functionName: {
        type: String,
        required: [true, 'Please provide function name to trigger'],
    }
});

const functionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide function name'],
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Please provide function content'],
    },
    idempotent: {
        type: Boolean,
        default: false
    }
});

const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide application name'],
        unique: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Application must belong to a user']
    },
    endpoints: {
        type: [endpointSchema],
        default: []
    },
    functions: {
        type: [functionSchema],
        default: []
    },
    packageJson: {
        type: String,
        default: function() {
            return this.defaultPackageJson();
        }
    }
});

applicationSchema.index({user: 1});

applicationSchema.methods.defaultPackageJson = function () {
    return `
            {
                "name": ${this.name},
                "version": "1.0.0",
                "description": ${this.name},
                "main": "index.js",
                "scripts": {
                    "test": "echo \\"Error: no test specified\\" && exit 1"
                },
                "keywords": [],
                "author": "",
                "license": "ISC",
                "dependencies": {
                    "express": "^4.17.3",
                    "mongoose": "^6.3.0"
                }
            }
    `;
}

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
