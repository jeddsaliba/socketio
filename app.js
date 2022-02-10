
require('dotenv').config();

const app = require('express')();
const fs = require('fs');

const ssl_key = process.env.SSL_KEY || null;
const ssl_cert = process.env.SSL_CERT || null;

const options = {
    key: fs.readFileSync(ssl_key, 'utf8'),
    cert: fs.readFileSync(ssl_cert, 'utf8')
};
var server;
var io;

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
if (ssl_key && ssl_cert) {
    server = require('https').createServer(options, app);
    io = require('socket.io')(server, options);
} else {
    server = require('http').createServer(app);
    io = require('socket.io')(server);
}
/* WHEN CONNECTION IS SUCCESSFUL */
io.on('connection', (socket) => {
    console.log('Socket Connected Successfully!', socket.id);
    /* JOIN TO A ROOM/CHANNEL/GROUP */
    socket.on('join', (room) => {
        console.log(socket.id + " subscribed to " + room);
        socket.join(room);
    });
    /* LEAVE FROM A ROOM/CHANNEL/GROUP */
    socket.on('leave', (room) => {
        console.log(socket.id + " unsubscribed to " + room);
        socket.leave(room);
    });
    /* ACTION LOGS LISTENER */
    socket.on("action-logs", (message) => {
        var payload = message['message'];
        console.log(payload);
        /* FORWARD THE MESSAGE TO ROOM/CHANNEL/GROUP: ACTION-LOGS-<PROJECTID> */
        /* ONLY USERS JOINED IN THE ROOM/CHANNEL/GROUP OF ACTION-LOGS-<PROJECTID> CAN RECEIVE THE NOTIFICATION */
        socket.to('action-logs-'+payload['project_id']).emit('action-logs-'+payload['project_id'], message);
    });
    /* NOTIFICATIONS LISTENER */
    socket.on("notifications", (message) => {
        var payload = message['message'];
        payload.forEach((data) => {
            console.log(data);
	        socket.to('notifications-'+data['receiver_user_id']).emit('notifications-'+data['receiver_user_id'], data);
        });
        /* FORWARD THE MESSAGE TO ROOM/CHANNEL/GROUP: NOTIFICATIONS-<RECEIVERUSERID> */
        /* ONLY USERS JOINED IN THE ROOM/CHANNEL/GROUP OF NOTIFICATIONS-<RECEIVERUSERID> CAN RECEIVE THE NOTIFICATION */
        // socket.to('notifications-'+payload['receiver_user_id']).emit('notifications-'+payload['receiver_user_id'], message);
    });
    /* WHEN DISCONNECTED */
    socket.on('disconnect', () => {
        console.log('Socket Disconnected', socket.id);
    });
});

server.listen(process.env.SSL_PORT, () => {
  console.log('listening on *:'+process.env.SSL_PORT);
});