const cron = require("node-cron");
const clusterService = require("./clusterService");
const {CUSTOM_SERVERLESS_RUNTIME} = require("../models/cluster/namespaces");

exports.scheduleRuntimeCleaner = () => {
    cron.schedule(
        '*/5 * * * *',
        async () => {
            const runtimes = await clusterService.listNamespacedService(CUSTOM_SERVERLESS_RUNTIME).catch(e => console.log(e));
            const currentDate = new Date().getTime();
            for (const service of runtimes.body.items) {
                if (currentDate > +service.metadata.labels.expire) {
                    await clusterService.deleteNamespacedService(service.metadata.name, CUSTOM_SERVERLESS_RUNTIME);
                    await clusterService.deleteNamespacedDeployment(`${service.metadata.name}-runtime`, CUSTOM_SERVERLESS_RUNTIME);
                    console.log(`${service.metadata.name} runtime has expired`);
                }
            }
        },
        {scheduled: true}
    );
};
