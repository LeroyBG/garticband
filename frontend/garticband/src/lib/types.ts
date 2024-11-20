// Composition component hierarchy. There's some prop drilling happening, but
// each parent/wrapper component takes care of at least one prop, hence the
// omissions

import type { Socket } from "socket.io-client"

export interface SequencerProps {
    rows: number
    timeSteps: number,
    disabled?: boolean,
    initialState?: boolean[][],
    synchronizedTick?: number,
    selectedSquareActive: (row: number) => void,
    hasBlackKeys: boolean, // Keys like a piano
    // Has to explicity be null otherwise we could unintentionally lose 
    // connection to backend
    io: Socket | null 
}

export interface SelectProps {
    io: Socket | null
}

export interface ComposerProps extends Omit<SequencerProps, "selectedSquareActive" | "rows"> {
    sampleFileNames: string[],
    centralAudioContext?: AudioContext,
    // Whether or not two sounds can play at once
    mutuallyExclusiveNotes: boolean,

}

export type InstrumentProps = Omit<ComposerProps, "sampleFileNames" | "mutuallyExclusiveNotes" | "hasBlackKeys">

type instrumentId = "drums" | "bass" | "synth" | "piano"

export interface SelectInstrumentProps extends InstrumentProps {
    instrumentId: instrumentId
}

export interface FinalCompositionProps extends Pick<SelectInstrumentProps, "timeSteps" | "centralAudioContext" | "io">  {
    roomState: roomInfo
}

// * * * * *  Room data structure stuff * * * * *

export type playerInRoom = {
    turnNumber: number | null // null if not yet decided,
    id: string,
    name: string,
    sequencer: {
        selectionGrid: boolean[][] | null, // null if no instrument selected
        instrumentId: instrumentId
    },
}

export type roomInfo = {
    players: playerInRoom[],
    activeTurn: number | null, // i.e. 1, 2, 3, 4,..., null if no active turn,
    selectPhase: boolean,
    isCompleted: boolean
}