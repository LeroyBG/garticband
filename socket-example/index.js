// need express, socketio, cors (for react), and nodemon

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

// defining port for connection, will default to localhost:3000
const PORT = process.env.PORT || 3000;

app.use(express.static("public"))

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
});

io.on("connection", (socket) => {

    // each user has a unique socket id when the connect
    console.log(`User connected: ${socket.id}`)

    // server practically puts the client into a separate "room" by an identifier that we give it
    socket.on("join_room", (data) => {
        socket.join(data.room);
        // socket.leave is a way to manually make a client leave a room
        // would be useful for allowing people to join other rooms (so they can leave the previous one)
    });

    // server receives the message sent by client and sends it back to ALL clients
    socket.on("send_message", (data) => {
        io.to(data.room).emit("receive_message", `${socket.id.substring(0,5)}: ${data.msg}`)
    });
})

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});
