const appVersion = require('./package.json').version;
const PORT = 8080 || process.env.PORT;
const AUTH_KEY = process.env.AUTH_KEY;

const fs = require('fs');
const socket = require('socket.io');
const cors = require("cors");
const utils = require('./modules/utils');
const websocket = require('ws')
const wss = new websocket.Server({port: PORT});

const path = require('path');
const http = require('http');
const express = require('express');
const { json } = require('stream/consumers');
const { randomUUID } = require('crypto');

//server stuff
const app = express();
const server = http.createServer(app);
//onst io = socket(server, {
//    cors: {origin: '*'},
//    transports: ['websocket', 'polling']
//});
//server.listen(PORT, () => {
//    console.log('Node Server now running on port ' + PORT);
//});;
app.locals["appVersion"] = appVersion;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json(), cors());
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use('/', require('./routes/index'));
app.use('/offer', require('./routes/offer'));
app.use(require('./routes/err404')); //err404

//=================================
let clients = {};
wss.on('connection', ws => {
    const clientID = Math.floor(Math.random()*2147483647);
    clients[clientID] = {
        "id": clientID,
        "ws": ws,
        "host": false
    }
    console.log(`[${clientID}] Client connected.`);
    send_message("CONNECTION_CONF", {
        "id": clientID
    }, clientID);

    ws.on('message', message => {
        console.log(`[${clientID}] Message receieved.`);
        let data;
        try {data = JSON.parse(message)}
        catch (err) {console.log(`[${clientID}] Invalid Message Format: ${err}`); return}
        //console.log(data);
        if (data.type == 'HOST') set_host(clientID);
        else if (data.type == 'RTC_HANDSHAKE_REQ') rtc_handshake(clientID, data.payload);
        else if (data.type == 'CANDIDATE' || data.type == 'OFFER' || data.type == 'ANSWER') {
            send_message(data.type, data.payload, data.payload.target_peer);
            console.log(`[${clientID}] Relaying ${data.type} data.`);
        }
    });

    ws.on('close', () => {
        console.log(`[${clientID}] Client disconnected.`);
        delete clients[clientID];
    });
});

console.log('Signaling server is running on port ', PORT);

function send_message(_t, _pl, target) {
    let ws = clients[target].ws;
    ws.send(JSON.stringify({
        type: _t,
        payload: _pl
    }));
}

function set_host(id) {
    clients[id].host = true;
    console.log(`[${id}] Started accepting connections.`);
    send_message("HOST_CONF", null, id);
}

function rtc_handshake(sender_id, target_id) {
    if (!(target_id in clients)) {
        console.log(`[${sender_id}] Tried to connect to an invalid ID...`);
        return;
    }
    if (!clients[target_id].host) {
        console.log(`[${sender_id}] Tried to connect to an ID that isn't hosting...`);
        return;
    }
    console.log(`[${sender_id}] Attempting to connect to ${target_id}.`);
    send_message("HANDSHAKE_RECEIVED", sender_id, target_id);
    send_message("HANDSHAKE_RECEIVED", target_id, sender_id);
}