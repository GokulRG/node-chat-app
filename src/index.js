const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let count = 0;

/**
 * server (emit) -> client (receive) => countUpdated
 * client (emit) -> server (receive) => increment
 */

io.on('connection', (socket) => {
    console.log('New web socket connection');
    socket.emit('countUpdated', count);
    socket.on('increment', () => {
        count++;
        // The below line only emits the event to the current connection and not to all connections. We need to broadcast the event to all connections
        // socket.emit('countUpdated', count);
        
        // This emits to all connections
        io.emit('countUpdated', count);
    });
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});