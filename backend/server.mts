import express from 'express'
import 'dotenv/config' // Loads environment variables from .env file
import roomRouter from './routes/rooms.mts'
import cors from 'cors'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { delay } from './util/util.mts'

// import { initializeApp, applicationDefault } from 'firebase-admin/app'

// initializeApp({
//     credential: applicationDefault(),
//     databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
// });

const app = express()
const { PORT, FRONTEND_URL } = process.env

app.use(express.json())
app.use(cors({
    origin: FRONTEND_URL
}))
app.use(express.static('public'))
app.use(morgan('dev'))

app.use("/rooms", roomRouter)

const httpServer = createServer(app)

// * * * * * * * * * * Socket logic * * * * * * * * * *
// Super temporary mapping of turn number to instruments
const TURN_DURATION = 30 * 100 // 30 sec 30 * 1000
const NUM_PLAYERS_PER_ROOM = 4

const genres = [
    "Jazz",
    "EDM",
    "Hard Rock",
    "Country"
]

const instruments = [
    "drums",
    "piano",
    "bass",
    "synth"
]

let playersInLobby = new Map<roomId, Set<string>>()

type roomId = string // null if no instrument selected

type playerInRoom = {
    turnNumber: number // null if not yet decided
    id: string,
    name: string,
    ready: boolean,
    sequencer: {
        selectionGrid: boolean[][] | null, // null if no instrument selected
        instrumentId: string
    },
}

type roomInfo = {
    players: playerInRoom[],
    selectPhase: boolean,
    activeTurn: number | null, // i.e. 1, 2, 3, 4,..., null if no active turn,
    isCompleted: boolean,
    gameOver: boolean
}

const rooms = new Map<roomId, roomInfo>()

const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL
    }
})

io.on("connection", (socket) => {
    console.log("client connected")

    // establish the room ID holder
    let roomId: roomId|null = null

    socket.on("join_room", (data) => {
        console.log("someone is trying to join a room")
        
        // server now holds roomId for specific client
        roomId = data.roomId
        const room = rooms.get(roomId) ?? null

        // If the room doesn't exist, create it
        if (!room) {
            console.log("room doesn't exist so we create it")
            const player: playerInRoom = {
                turnNumber: 1,
                id: socket.id,
                name: data.name,
                ready: false,
                sequencer: {
                    instrumentId: null,   // REPLACE THIS NULL
                    selectionGrid: Array(8).fill(Array(16).fill(false))
                }
            }
            const room: roomInfo = {
                players: [player],
                selectPhase: false,
                activeTurn: null,
                isCompleted: false,
                gameOver: false
            }
            socket.join(data.roomId)
            rooms.set(data.roomId, room)
            playersInLobby.set(data.roomId, new Set<string>([socket.id]))
            socket.emit("room_joined", { roomId: roomId, roomState: room, fullLobby: false})
        } else {
            let playerAlreadyInRoomDataStructure = false
            room.players.forEach((v) => {
                if (v.id == socket.id)
                    playerAlreadyInRoomDataStructure = true
            })
            if (room.players.length >= NUM_PLAYERS_PER_ROOM) {
                console.log("someone tried to join a room that's full")
                return
            }

            if (!playerAlreadyInRoomDataStructure) {
                // Assign player a turn number based on the order they joined the room
                // TODO: Make turn number random

                // Long ass expression to get the max turn number alr in the array
                const turnNumber = Math.max(...Array(room.players.length).fill(0).map((v, i) => room.players[i].turnNumber)) + 1
                const newPlayer: playerInRoom = {
                    turnNumber: turnNumber,
                    id: socket.id,
                    name: data.name,
                    ready: false,
                    sequencer: {
                        instrumentId: null,  // REPLACE IT WITH NULL
                        // Hardcoded selection grid for now
                        selectionGrid: Array(8).fill(Array(16).fill(false))
                    }
                }
                room.players.push(newPlayer)
            }
            
            
            
            socket.join(data.roomId)
            const lobby = playersInLobby.get(roomId)
            lobby.add(socket.id)
            socket.emit("room_joined", { roomId: data.roomId, roomState: room, fullLobby: lobby.size==4 ? true : false })
            socket.broadcast.to(data.roomId).emit("player_joined", { roomState: room, fullLobby: lobby.size==4 ? true : false })
        }
    })

    socket.on("change_ready", async (data) => {
        const room = rooms.get(roomId)
        let player = room.players.find(p => p.id == socket.id)
        player.ready = !player.ready
        console.log(room)

        io.to(roomId).emit("notify_ready", {
            roomState: room
        })
    })

    // add reciever for dealing with instrument selection
    socket.on("start_select", async (data) => {
        const room = rooms.get(roomId)
        room.selectPhase = true
        let i = Math.floor(Math.random() * 4)

        const lobby = playersInLobby.get(roomId)
        lobby.clear()
        console.log(lobby)

        io.to(roomId).emit("select_started", {
            roomState: room,
            genre: genres[i],
            fullLobby: false
        })
    })

    socket.on("choose_drum", async (data) => {
        const room = rooms.get(roomId)
        let player = room.players.find(p => p.id == socket.id)
        player.sequencer.instrumentId = "drums"

        io.to(roomId).emit("update_instrument", {
            roomState: room, instrument: "drums"
        })
    })

    socket.on("choose_synth", async (data) => {
        const room = rooms.get(roomId)
        let player = room.players.find(p => p.id == socket.id)
        player.sequencer.instrumentId = "synth"

        io.to(roomId).emit("update_instrument", {
            roomState: room, instrument: "synth"
        })
    })

    socket.on("choose_bass", async (data) => {
        const room = rooms.get(roomId)
        let player = room.players.find(p => p.id == socket.id)
        player.sequencer.instrumentId = "bass"

        io.to(roomId).emit("update_instrument", {
            roomState: room, instrument: "bass"
        })
    })

    socket.on("choose_piano", async (data) => {
        const room = rooms.get(roomId)
        let player = room.players.find(p => p.id == socket.id)
        player.sequencer.instrumentId = "piano"

        io.to(roomId).emit("update_instrument", {
            roomState: room, instrument: "piano"
        })
    })

    socket.on("start_game", async (data) => {
        // retrieve the correct room 
        const room = rooms.get(roomId)
        room.activeTurn = 1
        room.selectPhase = false

        // send a message to the room with the new room state (started)
        io.to(roomId).emit("game_started", {
            roomState: room
        })
        await delay(TURN_DURATION)
        for (let i = 1; i < NUM_PLAYERS_PER_ROOM; i++) {
            console.log("next turn")

            room.activeTurn++
            io.to(roomId).emit("new_turn", {
                roomState: room
            })
            await delay(TURN_DURATION)
        }
        room.activeTurn = null
        room.isCompleted = true
        console.dir(room, {
            depth: 6
        })
        io.to(roomId).emit("game_finished", {
            roomState: room
        })
        await delay(TURN_DURATION)
        room.gameOver = true
        room.players.forEach(user => {
            user.sequencer = {
                instrumentId: null,   
                selectionGrid: Array(8).fill(Array(16).fill(false))
            }
            user.ready = false
        })
        io.to(roomId).emit("game_over", {
            roomState: room
        })
    })

    socket.on("back_lobby", async (data) => {
        const room = rooms.get(roomId)
        const lobby = playersInLobby.get(roomId)
    
        if (!lobby.has(socket.id))
            lobby.add(socket.id)

        room.gameOver = false
        room.isCompleted = false
        io.to(socket.id).emit("reset", {
            roomState: room
        })

        if (lobby.size == 4)
            io.to(roomId).emit("update_lobby", {fullLobby: true})
    })

    // Broadcast updates to players' sequencers
    socket.on("update", ({ selectionGrid }) => {
        const room = rooms.get(roomId)
        const player = room.players.find(p => p.id == socket.id)
        player.sequencer.selectionGrid = selectionGrid
    })

    socket.on("disconnect", (reason) => {
        const room = rooms.get(roomId)
        const lobby = playersInLobby.get(roomId)
        if (room) {
            // If we're the last player to leave the room
            if (room.players.length == 1) {
                rooms.delete(roomId)
                if (lobby)
                    playersInLobby.delete(roomId)
            }

            if (lobby && lobby.has(socket.id)) {
                lobby.delete(socket.id)
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
        if (lobby)
            socket.broadcast.to(roomId).emit("player_left", { roomState: room, fullLobby: lobby.size==4 ? true : false })
        else
            socket.broadcast.to(roomId).emit("player_left", { roomState: room, fullLobby: false })
    })
})
// * * * * * * * * * * Socket logic * * * * * * * * * * 

httpServer.listen(PORT, () => {
    console.log("Server listening on port", PORT)
})