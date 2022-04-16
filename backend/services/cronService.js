const cron = require("node-cron");
const clusterService = require("./clusterService");

exports.scheduleRuntimeCleaner = () => {
    cron.schedule(
        '*/5 * * * *',
        async () => {
            const runtimes = await clusterService.listNamespacedService('custom-serverless-runtime').catch(e => console.log(e));
            const currentDate = new Date().getTime();
            for (const service of runtimes.body.items) {
                if(currentDate > +service.metadata.labels.expire) {
                     await clusterService.deleteNamespacedService(service.metadata.name, 'custom-serverless-runtime');
                    await clusterService.deleteNamespacedDeployment(`${service.metadata.name}-runtime`, 'custom-serverless-runtime');
                    console.log(`${service.metadata.name} runtime has expired`);
                }
            }
        },
        {scheduled: true}
    );
};
