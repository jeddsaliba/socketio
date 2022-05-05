
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
    var date = new Date().toLocaleString();
    log_file.write(date + ' ' + util.format(d) + '\n');
    log_stdout.write(date + ' ' + util.format(d) + '\n');
};

if (ssl_key && ssl_cert) {
    server = require('https').createServer(options, app);
    io = require('socket.io')(server, options);
} else {
    server = require('http').createServer(app);
    io = require('socket.io')(server);
}

/* WHEN CONNECTION IS SUCCESSFUL */
io.on('connection', (socket) => {
    console.log(socket.id + ' Socket Connected Successfully!');
    /* JOIN TO A ROOM/CHANNEL/GROUP */
    socket.on('join', (room) => {
        console.log(socket.id + " joined " + room);
        socket.join(room);
    });
    /* LEAVE FROM A ROOM/CHANNEL/GROUP */
    socket.on('leave', (room) => {
        console.log(socket.id + " left " + room);
        socket.leave(room);
    });
    /* MESSAGES LISTENER */
    socket.on("messages", (message) => {
        var payload = message['message'];
        /* FORWARD THE MESSAGE TO ROOM/CHANNEL/GROUP: MESSAGES-<PROJECTID> */
        /* ONLY USERS JOINED IN THE ROOM/CHANNEL/GROUP OF MESSAGES-<PROJECTID> CAN RECEIVE THE NOTIFICATION */
        console.log(payload);
        socket.to('messages-'+payload['project_id']).emit('messages-'+payload['project_id'], message);
    });
    /* NOTIFICATIONS LISTENER */
    socket.on("notifications", (message) => {
        var payload = message['message'];
        payload.forEach((data) => {
            /* FORWARD THE MESSAGE TO ROOM/CHANNEL/GROUP: NOTIFICATIONS-<RECEIVERUSERID> */
            /* ONLY USERS JOINED IN THE ROOM/CHANNEL/GROUP OF NOTIFICATIONS-<RECEIVERUSERID> CAN RECEIVE THE NOTIFICATION */
            console.log(data);
	        socket.to('notifications-'+data['receiver_user_id']).emit('notifications-'+data['receiver_user_id'], data);
        });
    });
    /* DEACTIVATION LISTENER */
    socket.on("deactivated", (message) => {
        var payload = message['message'];
        console.log(payload);
        socket.to('deactivated-'+payload['user_id']).emit('deactivated-'+payload['user_id'], message);
    });
    /* WHEN DISCONNECTED */
    socket.on('disconnect', () => {
        console.log(socket.id + ' Socket Disconnected');
    });
});

server.listen(process.env.SSL_PORT, () => {
    console.log('listening on *:'+process.env.SSL_PORT);
});