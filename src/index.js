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

io.on('connection', (socket) => {
    // This is the entry point on connection establishment, we'll continue to interact with established connections inside this method
    socket.emit('message', 'Welcome!');

    socket.on('sendMessage', (message) => {
        io.emit('message', message);
    });
});

server.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
