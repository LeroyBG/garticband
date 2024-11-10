<script lang="ts">
    import { PUBLIC_SERVER_URL } from '$env/static/public'
    import { io } from "./socketConnection";
    import { instrumentSamples } from "$lib/instrumentSamples"
    import { untrack } from 'svelte';

    type instrument = "drums" | "piano" | "bass" | "synth"
    interface props {
        instrumentId: instrument,
        timeSteps: number,
        disabled?: boolean,
        initialState?: boolean[][],
        synchronizedTick?: number
    }
    const { instrumentId, disabled, timeSteps, initialState, synchronizedTick }: props = $props()

    let numRows = instrumentSamples[instrumentId].length

    let sequencerState = $state<boolean[][]>(initialState ?? Array(numRows).fill(Array(timeSteps).fill(false)))

    let loading = $state<boolean>(true)

    let tick = $state<number>(0)

    let sources: (AudioBufferSourceNode|null)[] = Array(numRows).fill(null)

    let audioContext: AudioContext = new AudioContext()

    let audioBuffers: AudioBuffer[]|null = null

    let asyncEffectRunning = false

    $inspect(synchronizedTick)


    /*
                                    COL INDEX
      ROW INDEX 0       1       2       3       4       5       6       7 
        0       True    False   ...     ...     ...     ...     ...     ...
        1       False   False   ...     ...     ...     ...     ...     ...
        2       False   ...     ...     ...     ...     ...     ...     ...
        3       False   ...     ...     ...     ...     ...     ...     ...
    */
    
    const constructConditionalKeyStyling = (selected: boolean, active: boolean, black: boolean, colIndex: number): string => {
        const usingKeys = instrumentId != "drums"
        if (active) {
            return selected ? "bg-yellow-400 border-4 border-yellow-200" : "bg-yellow-100 border-2 border-yellow-300"
        } else {
            let style = `border-2 border-${(colIndex % 4 == 0) ? "black" : "grey-500"} `
            if (selected) {
                style += (black && usingKeys) ? "bg-green-400" : "bg-green-200"
            } else {
                style += (black && usingKeys) ? "bg-gray-100" : ""
            }
            return style
        }
    }

    // Which keys should be colored black
    // Using indexing rows from the top (because of how they're created in the
    // #each statement) using 0-based indexing 
    const blackKeyIndices = new Set([1, 3, 5, 8, 10])
    
    const sequencerStyle = $derived<string[][]>(sequencerState.map((row, i) => {
        return row.map((_, j) => {
            return constructConditionalKeyStyling(
                sequencerState[i][j], 
                (synchronizedTick ?? tick) == j, 
                blackKeyIndices.has(i), 
                j)
        })
    }))
    
    const updateSelection = (rowIndex: number, colIndex: number) => {
        // if (disabled) {
        //     return
        // }
        sequencerState = sequencerState.map((row: boolean[], i) => 
                row.map((val, j)=> 
                    (i == rowIndex && j == colIndex) ? (!val) : val
                )
            )
        // This could overwhelm the server if a bunch of ppl start spamming
        // buttons
        io.emit("update", {
            selectionGrid: sequencerState
        })
    }

    const muteAllNotes = (nodes: (AudioBufferSourceNode|null)[]) => {
        nodes.forEach((_, i) => {
                if (nodes[i]) {
                    nodes[i].stop() 
                    nodes[i] = null
                }
            }
        )
    }
    

    $effect(() => {
        console.log("effect ran")
        let interval = -1
        const go = async () => {
            asyncEffectRunning = true
            console.log("async brah ran")
            // Grab samples
            const fetchedAudio = await Promise.all(instrumentSamples[instrumentId].map((s)=>fetch(`${PUBLIC_SERVER_URL}/samples/${s}`)))
            const arrayBuffers: ArrayBuffer[] = await Promise.all(fetchedAudio.map((f: Response) => f.arrayBuffer()))
            audioBuffers = await Promise.all(arrayBuffers.map(b=>audioContext.decodeAudioData(b)))
            // If we have to handle our own ticking 
            
            loading = false
            asyncEffectRunning = false

            // // Do interval if necessary
            // if (synchronizedTick !== undefined) {
            //     return
            // }
            // interval = setInterval(() => {
            //     tick = (tick + 1) % sequencerState[0].length
            //     for (let i = 0; i < sequencerState.length; i++) {
            //         if (sequencerState[i][tick]) {
            //             if (instrumentId == "synth" || instrumentId == "bass") {
            //                 muteAllNotes(sources)
            //             }
            //             sources[i]?.stop()
            //             sources[i] = audioContext.createBufferSource()
            //             // @ts-ignore -- Won't be null
            //             sources[i]!.buffer = audioBuffers[i]
            //             sources[i]!.connect(audioContext.destination)
            //             sources[i]!.start()
            //             sources[i]!.onended = () => {
            //                 sources[i] = null
            //             }
            //         }
            //     }
            // }, 200);
        }
        if (!audioBuffers && !asyncEffectRunning)
            go()
    

        console.log(synchronizedTick, audioBuffers)
        // If the tick is coming from a prop
        if (synchronizedTick === undefined || !audioBuffers) {
            return
        }
        for (let i = 0; i < untrack(() => sequencerState).length; i++) {
                if (untrack(() => sequencerState)[i][synchronizedTick]) {
                    if (instrumentId == "synth" || instrumentId == "bass") {
                        muteAllNotes(sources)
                    }
                    sources[i]?.stop()
                    sources[i] = audioContext.createBufferSource()
                    // @ts-ignore -- Won't be null
                    sources[i]!.buffer = audioBuffers[i]
                    sources[i]!.connect(audioContext.destination)
                    sources[i]!.start()
                    sources[i]!.onended = () => {
                        sources[i] = null
                    }
                }
            }
        return () => clearInterval(interval)

    })
</script>

{#if loading}
    <p class="flex items-center justify-center">loading samples...</p>
{:else}
    <div id="selection grid container" class="gap-4 flex flex-col">
        {#each sequencerState as row, rowIndex}
            <div class="flex flex-row justify-evenly">
                {#each row as node, colIndex}
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button type="button" 
                        onclick={()=>updateSelection(rowIndex, colIndex)} 
                        class={"h-6 w-6 " + sequencerStyle[rowIndex][colIndex]}
                    ></button>
                {/each}
            </div>
        {/each}
    </div>
{/if}