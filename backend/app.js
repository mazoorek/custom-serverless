const express = require('express');
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
const ws = require('ws');
const mongoose = require('mongoose');
const router = require('./routes/router');
const clusterService = require('./services/clusterService');
const cronService = require('./services/cronService');

dotenv.config({path: './.env'});
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use('/api', router);

const userSchema = new mongoose.Schema({
    name: String
});

const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.DB_URL, {}).then( async () => {
    console.log('DB connection successful!');
    const users = await User.find();
    console.log(users);
});


const server = app.listen(PORT, HOST, async () => {
    console.log(`Running on port ${PORT}`);
    await clusterService.setupClusterConnection();
    cronService.scheduleRuntimeCleaner();
});

const wsServer = new ws.Server({noServer: true, path: "/ws"});

server.on('upgrade', (request, socket, head) => {
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



