const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Please provide application name'],
        unique: true,
        sparse: true
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
        unique: true,
        sparse: true
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
    up: {
        type: Boolean,
        default: false
    },
    packageJson: {
        type: String
    }
});

applicationSchema.index({user: 1});

applicationSchema.pre('save', async function(next) {
    await this.populate({
        path: 'user',
        select: 'email'
    });
    if(!this.packageJson) {
        this.packageJson = this.defaultPackageJson();
    }
    next();
});

applicationSchema.methods.defaultPackageJson = function () {
    return `\n{\n    \"name\": \"${this.name}\",\n    \"version\": \"1.0.0\",
    \n    \"description\": \"${this.name}\",\n    \"main\": \"index.js\",
    \n    \"scripts\": {\n      \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"\n    },
    \n    \"keywords\": [],\n    \"author\": \"${this.user.email}\",\n    \"license\": \"ISC\",
    \n    \"dependencies\": {
    \n      \"express\": \"^4.17.3\",
    \n      \"mongoose\": \"^6.3.0\",
    \n      \"dotenv\": \"^10.0.0\",
    \n      \"package-json-validator\": \"^0.6.3\"
    \n    }\n}\n`;
}

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
