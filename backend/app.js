const express = require('express');
const startup = require('./startup/index');
const middleware = require("./middleware/index");
const websockets = require("./websockets/index");
const clusterService = require('./services/clusterService');
const cronService = require('./services/cronService');
const applicationsService = require('./services/applicationsService');

startup().then(() => {
    const PORT = 8080;
    const app = express();
    middleware(app);
    const server = app.listen(PORT, async () => {
        console.log(`Running on port ${PORT}`);
        await clusterService.setupClusterConnection();
        cronService.scheduleRuntimeCleaner();
        await applicationsService.runAppsThatShouldBeUp();
    });
    websockets(server);
}).catch( error => {
    console.log(error);
})



