const cron = require("node-cron");

exports.scheduleRuntimeCleaner = () => {
    cron.schedule(
        '*/5 * * * *',
        async () => {
            const runtimes = await k8sCoreV1Api.listNamespacedService('custom-serverless-runtime');
            const currentDate = new Date().getTime();
            for (const service of runtimes.body.items) {
                if(currentDate > +service.metadata.labels.expire) {
                    await k8sCoreV1Api.deleteNamespacedService(service.metadata.name, 'custom-serverless-runtime');
                    await k8sAppsV1Api.deleteNamespacedDeployment(`${service.metadata.name}-runtime`, 'custom-serverless-runtime');
                    console.log(`${service.metadata.name} runtime has expired`);
                }
            }
        },
        {scheduled: true}
    );
};
