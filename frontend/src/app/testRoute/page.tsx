'use client'
import { useEffect, useState } from "react"

// IMPORTANT: 

const updateSelection = (rowIndex: number, colIndex: number, selections: boolean[][], setSelections: any) => {
    setSelections(selections.map((row: boolean[], i) => 
        row.map((val, j)=> 
            (i == rowIndex && j == colIndex) ? (!val) : val
        )
    ))
    console.log(selections)
}

const delay = (ms: number) => new Promise((resolve) => (setTimeout(resolve, ms)))

export default function Test() {
    const audioSampleNames = [
        "Clap.wav",
        "Conga-High.wav",
        "Hihat.wav",
        "Kick-Basic.wav"
    ]

    const NUM_INSTRUMENTS = audioSampleNames.length
    const NUM_TIME_STEPS = 16

    const [loading, setLoading] = useState(true)
    const [selections, setSelections] = useState<boolean[][]>(
        Array(NUM_INSTRUMENTS).fill(Array(NUM_TIME_STEPS).fill(false))
    )
    const [tick, setTick] = useState<number>(0)
    
    useEffect(() => {
        const actualEffect = async () => {
            setLoading(true)
            const audioContext = new AudioContext()
            const fetchedAudio = await Promise.all(audioSampleNames.map(s => fetch(`http://localhost:8080/${s}`)))
            console.log('got samples', fetchedAudio)
            const arrayBuffers = await Promise.all(fetchedAudio.map(f=>f.arrayBuffer()))
            const audioBuffers = await Promise.all(arrayBuffers.map(b=>audioContext.decodeAudioData(b)))
            const sources: Array<AudioBufferSourceNode|null> = 
                Array(fetchedAudio.length).fill(0).map(() => audioContext.createBufferSource())
            console.log(sources)
            sources.forEach((source, i) => {
                source!.buffer = audioBuffers[i]
                source!.connect(audioContext.destination)
            })
            setLoading(false)

            setInterval(() => {
                console.log(selections)
                setTick((prevTick) => (prevTick + 1) % selections[0].length);
                for (let i = 0; i < selections.length; i++) {
                    if (selections[i][tick]) {
                        if (!sources[i]) {
                            sources[i] = audioContext.createBufferSource()
                            sources[i]!.buffer = audioBuffers[i]
                            sources[i]!.connect(audioContext.destination)
                        }
                        console.log("playing", i, tick)
                        console.log(sources[i])
                        sources[i]!.start()
                        sources[i] = null
                    }
                }
            }, 1000)
        }
        actualEffect()
    }, [])

    // The following code is hard to read because it's written in React instead
    // of Svelte
    return (
        loading ?
            <p className="flex items-center justify-center">loading samples...</p>
        :
            <div id="selection grid container" className="gap-4 flex flex-col">
            {selections.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-row justify-evenly">
                {row.map((_, colIndex) => {
                    return (
                        <div
                            key={colIndex}
                            onClick={()=>updateSelection(rowIndex, colIndex, selections, setSelections)}
                            className={"h-6 w-6 " + 
                                ((tick === colIndex) ? 
                                    (selections[rowIndex][colIndex] ? 
                                        "bg-red-400" : "bg-gray-600"
                                    )
                                    :
                                    (selections[rowIndex][colIndex] ? 
                                        "bg-red-300" : "bg-gray-400"
                                    )
                                )}
                        />
                    )
                })}
                </div>
            ))}
            </div>
        )
}