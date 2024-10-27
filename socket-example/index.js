const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

// defining port for connection, will default to localhost:3000
const PORT = process.env.PORT || 3000;

app.use(express.static("public"))

// state 
// each user has name, ID, room ID associated with it, ADD A FIELD INDICATING PLAYER # USING ROOM SIZE
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

// CREATE A ROOM STATE THAT KEEPS TRACK OF EXISTING ROOMS (THIS MIGHT NOT BE NEEDED)
// example room: 
/*
room = {
    id: lemon
    size: #
    players: (list)
}
*/
const RoomState = {
    rooms: [],
    setRooms: function (newRoomArray) {
        this.rooms = newRoomArray
    }
}

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
});

io.on("connection", (socket) => {

    // each user has a unique socket id when the connect
    console.log(`User connected: ${socket.id}`)

    // server practically puts the client into a separate "room" by an identifier that we give it
    socket.on("join_room", ({room, name}) => {

        // create a user object once they've made a name and joined a room, store it
        const user = activateUser(socket.id, name, room)

        socket.join(user.room);

        // socket.leave is a way to manually make a client leave a room
        // would be useful for allowing people to join other rooms (so they can leave the previous one)

        // Update user list for room when someone joins
        io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
        })

        // TO SEND A MESSAGE PRIVATELY TO ONE SPECIFIC USER:
        // io.to(socketId).emit('privateMessage', 'Hello, this is a private message');
        // WE CAN USE THIS WHEN CERTAIN PLAYERS ARE COMPOSING, AND THE REST ARE WAITING
    });

    // handler for when client sends a chat message to the server
    socket.on("send_message", (data) => {

        // server receives the message sent by client and sends it back to ALL clients
        io.to(data.room).emit("receive_message", `${socket.id.substring(0,5)}: ${data.msg}`)
    });

    // handler for when a player disconnects
    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        userLeavesApp(socket.id)

        // update the user list that players will see in their rooms
        if (user) {
            io.to(user.room).emit('userList', {
                users: getUsersInRoom(user.room)
            })
        }
        console.log(`User ${socket.id} disconnected`)
    })
})

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});


// User functions 
function activateUser(id, name, room) {
    const user = { id, name, room }
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

function userLeavesApp(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    )
}

function getUser(id) {
    return UsersState.users.find(user => user.id === id)
}

function getUsersInRoom(room) {
    return UsersState.users.filter(user => user.room === room)
}
