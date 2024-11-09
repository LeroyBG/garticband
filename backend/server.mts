import express from 'express'
import 'dotenv/config' // Loads environment variables from .env file
import roomRouter from './routes/rooms.mts'
import cors from 'cors'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { delay } from './util/util.mts'

import { initializeApp, applicationDefault } from 'firebase-admin/app'

initializeApp({
    credential: applicationDefault(),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

const app = express()
const { PORT, FRONTEND_URL } = process.env

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use("/rooms", roomRouter)

const httpServer = createServer(app)

// * * * * * * * * * * Socket logic * * * * * * * * * *
// Super temporary mapping of turn number to instruments
const TURN_DURATION = 60 * 1000 // 1 min

const instruments = [
    "drums",
    "piano",
    "bass",
    "synth"
]
type roomId = string // null if no instrument selected

type playerInRoom = {
    turnNumber: number // null if not yet decided
    id: string,
    sequencer: {
        selectionGrid: boolean[][] | null, // null if no instrument selected
        instrumentId: string
    },
}

type roomInfo = {
    players: playerInRoom[],
    activeTurn: number | null, // i.e. 1, 2, 3, 4,..., null if no active turn,
    isCompleted: boolean
}

const rooms = new Map<roomId, roomInfo>()

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
})

io.on("connection", (socket) => {
    console.log("client connected")
    let roomId: roomId|null = null

    socket.on("join_room", (data) => {
        console.log("someone is trying to join a room")
        roomId = data.roomId
        const room = rooms.get(roomId) ?? null

        // If the room doesn't exist, create it
        if (!room) {
            console.log("room doesn't exist so we create it")
            const player: playerInRoom = {
                turnNumber: 1,
                id: socket.id,
                sequencer: {
                    instrumentId: instruments[0],
                    selectionGrid: Array(8).fill(Array(16).fill(false))
                }
            }
            const room: roomInfo = {
                players: [player],
                activeTurn: null,
                isCompleted: false
            }
            socket.join(data.roomId)
            rooms.set(data.roomId, room)
            socket.emit("room_joined", { roomId: roomId, roomState: room })
        } else {
            const MAX_PLAYERS_PER_ROOM = 4
            let playerInRoom = false
            room.players.forEach((v) => {
                if (v.id == socket.id)
                    playerInRoom = true
            })
            if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
                console.log("someone tried to join a room that's full")
                return
            }
            
            // Assign player a turn number based on the order they joined the room
            // TODO: Make turn number random

            // Long ass expression to get the max turn number alr in the array
            const turnNumber = Math.max(...Array(room.players.length).fill(0).map((v, i) => room.players[i].turnNumber)) + 1
            const newPlayer: playerInRoom = {
                turnNumber: turnNumber,
                id: socket.id,
                sequencer: {
                    instrumentId: instruments[turnNumber - 1],
                    // Hardcoded selection grid for now
                    selectionGrid: Array(8).fill(Array(16).fill(false))
                }
            }
            room.players.push(newPlayer)
            socket.join(data.roomId)
            socket.emit("room_joined", { roomId: data.roomId, roomState: room })
            socket.broadcast.to(data.roomId).emit("player_joined", { roomState: room })
        }
    })

    socket.on("disconnect", (reason) => {
        const room = rooms.get(roomId)
        if (room) {
            // If we're the last player to leave the room
            if (room.players.length == 1) {
                rooms.delete(roomId)
            }
            
            // Remove this player's entry from the room
            room.players = room.players.filter((p) => p.id != socket.id)
            room.players = room.players.map((p, i) => {
                return {
                    ...p,
                    turnNumber: i + 1
                }
            })
        }

        socket.broadcast.to(roomId).emit("player_left", { roomState: room })
    })
})
// * * * * * * * * * * Socket logic * * * * * * * * * * 

httpServer.listen(PORT, () => {
    console.log("Server listening on port", PORT)
})