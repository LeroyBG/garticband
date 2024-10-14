import express from 'express'
import { getAuth } from '../middleware/auth.mjs'

type playerId = string
type roomId = number | null // null if no instrument selected

type playerInRoom = {
    id: playerId,
    timeSinceLastPulse: number // In milliseconds
    turnNumber: number | null // null if not yet decided
    sequencer: {
        selectionGrid: boolean[][] | null, // null if no instrument selected
        instrumentId: string
    },
}

type roomInfo = {
    players: playerInRoom[],
    createdAt: number, // In milliseconds
    activeTurn: number | null // i.e. 1, 2, 3, 4,..., null if no active turn
}

const roomInfoMap = new Map<roomId, roomInfo>()

const router = express.Router()

router.use(getAuth)

// Create a new room and add the requesting client to the room
router.post("create", (req, res, next) => {
    const newRoomId = Date.now()

    const newPlayerInfo: playerInRoom = {
        // @ts-ignore -- use declaration merging in the future
        // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
        id: req.userId,
        timeSinceLastPulse: 0,
        turnNumber: null,
        sequencer: {
            selectionGrid: null,
            instrumentId: null
        }
    }

    const newRoom: roomInfo = {
        players: [newPlayerInfo],
        createdAt: Date.now(),
        activeTurn: null
    }

    roomInfoMap.set(newRoomId, newRoom)

    res.status(201).json({
        roomId: newRoomId
    })
})

// Add requesting player to existing room
router.post(":roomId/join", (req, res, next) => {
    const newPlayerInfo: playerInRoom = {
        // @ts-ignore -- use declaration merging in the future
        // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
        id: req.userId,
        timeSinceLastPulse: 0,
        turnNumber: null,
        sequencer: {
            selectionGrid: null,
            instrumentId: null
        }
    }

    // Error case: parsing fails
    const roomId = parseInt(req.params.roomId, 10)
    const existingRoom = roomInfoMap.get(roomId)

    // Error case: room doesn't exist
    // Error case: player already in room
    // Error case: player already in a different room (?????)
    existingRoom.players.push(newPlayerInfo)

    res.status(200)
})

// Pulse requests reset server’s time-since-last pulse value for the requesting user in their current
// room
router.post(":roomId/pulse", (req, res, next) => {
    // Error case: parsing fails
    // Error case: room doesn't exist
    // Error case: player not in room
    const roomId = parseInt(req.params.roomId, 10)
    const existingRoom = roomInfoMap.get(roomId)
    const playerToUpdate = existingRoom.players.find((p) => {
        // @ts-ignore -- use declaration merging in the future
        // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
        p.id = req.userId
    })
    
    // Update player's timeSinceLastPulse
    playerToUpdate.timeSinceLastPulse = 0

    const responseData = {
        ...existingRoom,
        players: existingRoom.players.map((p) => {
            return {
                ...p,
                connectionStatus: p.timeSinceLastPulse < 4000 ? 'connected' :
                    p.timeSinceLastPulse < 7000 ? 'unstable' : 'disconnected'
            }
        })
    }
    return res.status(200).json(responseData)
})