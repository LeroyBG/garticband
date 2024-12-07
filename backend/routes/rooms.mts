import express from "express";
import { setAuthInResponse } from "../middleware/auth.mjs";

const ROOM_SIZE = 4; // How many players can be in a room - can change if we choose
const delay = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

type playerId = string;
type roomId = number | null; // null if no instrument selected

type playerInRoom = {
  id: playerId;
  timeSinceLastPulse: number; // In milliseconds
  turnNumber: number | null; // null if not yet decided
  sequencer: {
    selectionGrid: boolean[][] | null; // null if no instrument selected
    instrumentId: string;
  };
};

type roomInfo = {
  players: playerInRoom[];
  createdAt: number; // In milliseconds
  activeTurn: number | null; // i.e. 1, 2, 3, 4,..., null if no active turn,
  isCompleted: boolean;
};

const roomInfoMap = new Map<roomId, roomInfo>();

const router = express.Router();

router.use(setAuthInResponse);

// Create a new room and add the requesting client to the room
router.post("/create", (req, res, next) => {
  const newRoomId = Date.now();

  const newPlayerInfo: playerInRoom = {
    // @ts-ignore -- use declaration merging in the future
    // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
    id: req.uid,
    timeSinceLastPulse: 0,
    turnNumber: null,
    sequencer: {
      selectionGrid: null,
      instrumentId: null,
    },
  };

  const newRoom: roomInfo = {
    players: [newPlayerInfo],
    createdAt: Date.now(),
    activeTurn: null,
    isCompleted: false,
  };

  roomInfoMap.set(newRoomId, newRoom);

  res.status(201).json({
    roomId: newRoomId,
  });
});

// Add requesting player to existing room
router.post("/:roomId/join", (req, res, next) => {
  const newPlayerInfo: playerInRoom = {
    // @ts-ignore -- use declaration merging in the future
    // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
    id: req.uid,
    timeSinceLastPulse: 0,
    turnNumber: null,
    sequencer: {
      selectionGrid: null,
      instrumentId: null,
    },
  };

  // Error case: parsing fails
  const roomId = parseInt(req.params.roomId, 10);
  const existingRoom = roomInfoMap.get(roomId);

  // Error case: room doesn't exist
  // Error case: player already in room
  // Error case: player already in a different room (?????)
  existingRoom.players.push(newPlayerInfo);

  res.sendStatus(200);
});

// Pulse requests reset server’s time-since-last pulse value for the requesting user in their current
// room
// router.post("/:roomId/pulse", (req, res) => {
//   // Error case: parsing fails
//   // Error case: room doesn't exist
//   // Error case: player not in room
//   const roomId = parseInt(req.params.roomId, 10);
//   const existingRoom = roomInfoMap.get(roomId);
//   const playerToUpdate = existingRoom.players.find((p) => {
//     // @ts-ignore -- use declaration merging in the future
//     // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
//     p.id = req.uid;
//   });

//   // Update player's timeSinceLastPulse
//   playerToUpdate.timeSinceLastPulse = 0;

//   const responseData = {
//     ...existingRoom,
//     players: existingRoom.players.map((p) => {
//       return {
//         ...p,
//         connectionStatus:
//           p.timeSinceLastPulse < 4000
//             ? "connected"
//             : p.timeSinceLastPulse < 7000
//             ? "unstable"
//             : "disconnected",
//       };
//     }),
//   };
//   return res.status(200).json(responseData);
// });

// // Reset server’s time-since-last pulse value for the user in their current room
// // Starts a long-polling response, where the server repeatedly checks if all players have joined the room
// router.post("/:roomId/canStartGame", async (req, res) => {
//   const receivedAt = Date.now() - 1000; // Subtract a second to be conservative
//   // Error case: parsing fails
//   // Error case: room doesn't exist
//   // Error case: player not in room
//   const roomId = parseInt(req.params.roomId, 10);
//   const existingRoom = roomInfoMap.get(roomId);
//   const playerToUpdate = existingRoom.players.find((p) => {
//     // @ts-ignore -- use declaration merging in the future
//     // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
//     p.id = req.uid;
//   });

//   // Update player's timeSinceLastPulse
//   playerToUpdate.timeSinceLastPulse = 0;

//   // Check every 2.7 seconds if all players have joined
//   // Quit after 30 seconds to avoid a request timeout
//   while (
//     existingRoom.players.length !== ROOM_SIZE &&
//     Date.now() - receivedAt >= 30000
//   ) {
//     await delay(2700);
//   }
//   if (Date.now() - receivedAt >= 30000) {
//     return res.status(200).json({
//       canStartGame: false,
//     });
//   }
// });

// Updates room data structure with user’s selection grid and instrument used
// If user is last person to go, updates room game status to done
router.post("/:roomId/finishMyTurn", (req, res, next) => {
  // Error case: parsing fails
  // Error case: room doesn't exist
  // Error case: player not in room
  const roomId = parseInt(req.params.roomId, 10);
  const existingRoom = roomInfoMap.get(roomId);
  const playerToUpdate = existingRoom.players.find((p) => {
    // @ts-ignore -- use declaration merging in the future
    // https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript
    p.id = req.uid;
  });

  // Update player's timeSinceLastPulse
  playerToUpdate.timeSinceLastPulse = 0;

  // Will fail on malformed request
  playerToUpdate.sequencer = req.body;

  if (existingRoom.activeTurn == ROOM_SIZE) existingRoom.isCompleted = true;

  existingRoom.activeTurn++;

  res.sendStatus(200);
});

export default router;
