const socket = io();

socket.on('countUpdated', (count) => {
    console.log('The count has been updated!', count);
});

document.getElementById('incrementButton').addEventListener('click', () => {
    console.log('clicked');
    socket.emit('increment');
});