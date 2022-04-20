const ws = require("ws");
const cookie = require('cookie');
const clusterService = require("../services/clusterService");
const authService = require("../services/authService");

module.exports = (expressServer) => {
    const wsServer = new ws.Server({
        noServer: true,
        path: "/ws",
        verifyClient: async function (info, cb) {
            const cookies = info.req.headers.cookie;
            if(!cookies) {
                cb(false, 401, 'Unauthorized')
            } else {
                const jwtValid = (await authService.validateJwt(cookie.parse(cookies).jwt)).jwtValid;
                if (!jwtValid) {
                    cb(false, 401, 'Unauthorized')
                } else {
                    cb(true)
                }
            }
        }
    });

    expressServer.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, async socket => {
            wsServer.emit('connection', socket, request);
        });
    });

    wsServer.on('connection', socket => {
        console.log('user connected');
        socket.on('message', appName => {
            console.log(`start monitoring appName: ${appName}`);
            clusterService.monitorPodUntilRunning(
                appName,
                () => socket.send('ready'),
                () => socket.send('failed'),
            );
        });
    });
}
