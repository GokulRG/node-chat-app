const socket = io();

// Elements
const $messageForm = document.getElementById('message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.getElementById('share-location');
const $messages = document.querySelector('#messages');

// server (emit) -> client (receive) -- acknowledgement --> server
// client (emit) -> server (receive) -- acknowledgement --> client

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;

socket.on('message', (message) => {
	// console.log(message);
	// Removing the render from console and render it in the div
	const html = Mustache.render(messageTemplate, { message });
	$messages.insertAdjacentHTML('beforeend', html);
});

function resetFields() {
	$messageFormInput.value = '';
	$messageFormInput.focus();
}

$messageForm.addEventListener('submit', (event) => {
	event.preventDefault();

	// Disable the form here
	$messageFormButton.setAttribute('disabled', 'disabled');

	// we get event object on all events. event target here is the form itself. by accessing the elements array we get access to all the elements in the form. We can then pick the element of our choice by name is message
	const message = event.target.elements.message.value;

	// Using ack here
	// Ack is optional and it always takes the place of the last argument in addition to how many ever data arguments that we want to pass along.
	socket.emit('sendMessage', message, (error) => {
		// enable button again
		$messageFormButton.removeAttribute('disabled');
		resetFields();

		if (error) {
			return console.log(error);
		}

		console.log('Message Delivered!');
	});
});

$sendLocationButton.addEventListener('click', (event) => {
	event.preventDefault();
	if (!navigator.geolocation) {
		return alert("Geolocation isn't supported in this browser");
	}

	//Disable button here
	$sendLocationButton.setAttribute('disabled', 'disabled');

	// This still doesn't work with promises.. so we're using callback method
	navigator.geolocation.getCurrentPosition((position) => {
		// Re-enable location sharing button
		$sendLocationButton.removeAttribute('disabled');

		socket.emit(
			'sendLocation',
			{ latitude: position.coords.latitude, longitude: position.coords.longitude },
			() => {
				console.log('Location shared!');
			}
		);
	});
});
