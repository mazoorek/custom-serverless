const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Please provide application name'],
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

applicationSchema.methods.defaultFunctionContent = function () {
    return `async (args) => { 
    return {};
};`;
}

applicationSchema.methods.defaultPackageJson = function () {
    return `{\n    \"name\": \"${this.name}\",\n    \"version\": \"1.0.0\",
    \"description\": \"${this.name}\",\n    \"main\": \"index.js\",
    \"scripts\": {\n      \"test\":    \"echo \\\"Error: no test specified\\\" && exit 1\"\n    },
    \"keywords\": [],\n    \"author\": \"${this.user.email}\",\n    \"license\": \"ISC\",
    \"dependencies\": {
            \"express\": \"^4.17.3\",
            \"mongoose\": \"^6.3.0\",
            \"dotenv\": \"^10.0.0\"
    }\n}`;
}

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
