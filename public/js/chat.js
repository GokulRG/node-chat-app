const socket = io();

// server (emit) -> client (receive) -- acknowledgement --> server
// client (emit) -> server (receive) -- acknowledgement --> client

socket.on('message', (message) => {
	console.log(message);
});

function resetFields() {
	document.getElementById('message-form').elements.message.value = '';
}

document.getElementById('message-form').addEventListener('submit', (event) => {
	event.preventDefault();
	// we get event object on all events. event target here is the form itself. by accessing the elements array we get access to all the elements in the form. We can then pick the element of our choice by name is message
	const message = event.target.elements.message.value;

	// Using ack here
	// Ack is optional and it always takes the place of the last argument in addition to how many ever data arguments that we want to pass along.
	socket.emit('sendMessage', message, (error) => {
		if (error) {
			return console.log(error);
		}

		console.log('Message Delivered!');
	});
	resetFields();
});

document.getElementById('share-location').addEventListener('click', (event) => {
	event.preventDefault();
	if (!navigator.geolocation) {
		return alert("Geolocation isn't supported in this browser");
	}

	// This still doesn't work with promises.. so we're using callback method
	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			'sendLocation',
			{ latitude: position.coords.latitude, longitude: position.coords.longitude },
			() => {
				console.log('Location shared!');
			}
		);
	});
});
