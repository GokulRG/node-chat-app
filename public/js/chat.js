const socket = io();

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
	socket.emit('sendMessage', message);
	resetFields();
});
