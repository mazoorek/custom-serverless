const express = require('express');
const startup = require('./startup/index');
const middleware = require("./middleware/index");
const websockets = require("./websockets/index");
const clusterService = require('./services/clusterService');
const cronService = require('./services/cronService');

startup().then(() => {
    const HOST = '0.0.0.0';
    const PORT = 8080;
    const app = express();
    middleware(app);
    const server = app.listen(PORT, HOST, async () => {
        console.log(`Running on port ${PORT}`);
        await clusterService.setupClusterConnection();
        cronService.scheduleRuntimeCleaner();
        // TODO run client apps that should be in run state
    });
    websockets(server);
}).catch( error => {
    console.log(error);
})



