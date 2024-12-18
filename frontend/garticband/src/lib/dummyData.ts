import type { roomInfo } from "./types"

export const allFalseRoomState: roomInfo = {
    activeTurn: null,
    isCompleted: true,
    players: [
        {
            turnNumber: 1,
            id: "p1",
            name: "Steve",
            sequencer: {
                instrumentId: "drums",
                selectionGrid: Array(9).fill(Array(32).fill(false))
            }
        },
        {
            turnNumber: 2,
            id: "p2",
            name: "Mark",
            sequencer: {
                instrumentId: "piano",
                selectionGrid: Array(12).fill(Array(32).fill(false))
            }
        },
        {
            turnNumber: 3,
            id: "p3",
            name: "Robert",
            sequencer: {
                instrumentId: "bass",
                selectionGrid: Array(12).fill(Array(32).fill(false))
            }
        },
        {
            turnNumber: 4,
            id: "p4",
            name: "Jim",
            sequencer: {
                instrumentId: "synth",
                selectionGrid: Array(12).fill(Array(32).fill(false))
            }
        }
    ]
}


export const randomRoomState: roomInfo = {
    activeTurn: null,
    isCompleted: true,
    players: [
        {
            turnNumber: 1,
            id: "p1",
            name: "Steve",
            sequencer: {
                instrumentId: "drums",
                selectionGrid: Array(9).fill(0).map(() => Array(32).fill(0).map(() => Math.random() < 0.1 ? true : false))
            }
        },
        {
            turnNumber: 2,
            id: "p2",
            name: "Mark",
            sequencer: {
                instrumentId: "piano",
                selectionGrid: Array(9).fill(0).map(() => Array(32).fill(0).map(() => Math.random() < 0.1 ? true : false))
            }
        },
        {
            turnNumber: 3,
            id: "p3",
            name: "Robert",
            sequencer: {
                instrumentId: "bass",
                selectionGrid: Array(9).fill(0).map(() => Array(32).fill(0).map(() => Math.random() < 0.1 ? true : false))
            }
        },
        {
            turnNumber: 4,
            id: "p4",
            name: "Jim",
            sequencer: {
                instrumentId: "synth",
                selectionGrid: Array(9).fill(0).map(() => Array(32).fill(0).map(() => Math.random() < 0.1 ? true : false))
            }
        }
    ]
}