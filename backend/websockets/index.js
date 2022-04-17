const ws = require("ws");
const clusterService = require("../services/clusterService");

module.exports =  (expressServer) => {
    const wsServer = new ws.Server({noServer: true, path: "/ws"});

    expressServer.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            const cookies = request.headers.cookie;
            console.log(`cookies: ${cookies}`);
            // TODO ws authentication
            // var validationResult = validateCookie(req.headers.cookie);
            // if (validationResult) {
            //     //...
            // } else {
            //     socket.write('HTTP/1.1 401 Web Socket Protocol Handshake\r\n' +
            //         'Upgrade: WebSocket\r\n' +
            //         'Connection: Upgrade\r\n' +
            //         '\r\n');
            //     socket.close();
            //     socket.destroy();
            //     return;
            // }
            // //...
            wsServer.emit('connection', socket, request);
        });
    });

    wsServer.on('connection', socket => {
        socket.on('message', appName => {
            clusterService.monitorPodUntilRunning(appName, () => socket.send('ready'));
        });
    });
}
