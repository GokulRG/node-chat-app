const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
	// Listener for join
	socket.on('join', ({ username, room }) => {
		// Once you join a room you get access to additional funcitionality to address connections specific to that room alone
		// io.to(room).emit;socket.broadcast.to(room).emit
		socket.join(room);

		// This is the entry point on connection establishment, we'll continue to interact with established connections inside this method
		socket.emit('message', generateMessage('Welcome!'));

		// This event is emitted to all connections in the room except the current connection/socket.
		socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined the chat!`));
	});

	// the callback is for ack
	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed in the chat!!');
		}
		// Send it to all connections including the current connection
		io.emit('message', generateMessage(message));
		callback();
	});

	// Adding ack callback
	socket.on('sendLocation', (location, callback) => {
		io.emit('locationMessage', generateLocationMessage(location));
		callback();
	});

	// A disconnect will be handled like so and not what you expect, like io.on (disconnect) or anything like that.
	// Also once a socket disconnects, you can't do anythiing on that socket object anymore since it has already disconnected.
	// so we can use io.emit to broadcast to the other connections(here it would work like socket.broadcast.emit)
	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left the chat!'));
	});
});

server.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
