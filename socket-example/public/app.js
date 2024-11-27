const socket = io.connect('http://localhost:3000');

// define the variables for chatroom (THESE WOULD PROBABLY BE STATES IN REACT)
const msg = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const usersList = document.querySelector('.user-list')

// WE CAN JUST HAVE A DATA STRUCTURE THAT STORES EACH ROOM ID IF NEEDED

// clients send message to the server that they wish to send to other clients
const sendMessage = (e) => {
    e.preventDefault()

    // don't send anything if empty message
    if (msg.value && chatRoom.value) {
        socket.emit("send_message", { msg: msg.value, room: chatRoom.value });
        msg.value = "";
    }
    msg.focus()
    
};

// once clients input a room ID and presses join, a request is sent to the server to let them join that room
const joinRoom = (e) => {
    e.preventDefault()
    if(chatRoom.value && nameInput.value) {
        socket.emit("join_room", { 
            room: chatRoom.value,
            name: nameInput.value 
        })
    }
};

// this deals with how clients should behave when receiving a message from the server 
socket.on("receive_message", (data) => {
    const li = document.createElement('li')
    li.textContent = data
    document.querySelector('ul').appendChild(li)
})

// handler for when server sends all users in current room
socket.on('userList', ({ users }) => {
    showUsers(users)
})

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', joinRoom)

function showUsers(users) {
    usersList.textContent = ''
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ","
            }
        })
    }  
}