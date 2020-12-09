const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
	// Listener for join
	socket.on('join', (options, callback) => {
		// Incorporating add user
		const { error, user } = addUser({ id: socket.id, ...options });

		// Callback on error
		if (error) {
			return callback(error);
		}

		// Once you join a room you get access to additional funcitionality to address connections specific to that room alone
		// io.to(room).emit;socket.broadcast.to(room).emit
		socket.join(user.room);

		// This is the entry point on connection establishment, we'll continue to interact with established connections inside this method
		socket.emit('message', generateMessage('Welcome!'));

		// This event is emitted to all connections in the room except the current connection/socket.
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the chat!`));

		// Track event for user joining to refresh user list
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});

		// Callback -- On success
		callback();
	});

	// the callback is for ack
	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed in the chat!!');
		}

		const user = getUser(socket.id);

		if (user) {
			// Send it to all connections including the current connection
			io.to(user.room).emit('message', generateMessage(message, user.username));
			return callback();
		}
		callback('User/Room not found!');
	});

	// Adding ack callback
	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);

		if (user) {
			io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location));
			return callback();
		}

		callback('User/Room not found!');
	});

	// A disconnect will be handled like so and not what you expect, like io.on (disconnect) or anything like that.
	// Also once a socket disconnects, you can't do anythiing on that socket object anymore since it has already disconnected.
	// so we can use io.emit to broadcast to the other connections(here it would work like socket.broadcast.emit)
	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat!`));

			// Emit roomData event to update list of users in room
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
