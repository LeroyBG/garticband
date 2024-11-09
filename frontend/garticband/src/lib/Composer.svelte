<script lang="ts">
    import { sequencerState } from "./sequencerState";
    import { PUBLIC_SERVER_URL } from '$env/static/public'
    import { io } from "./socketConnection";
    const NUM_TIMESTEPS = 32
    const { instrumentId } = $props()
    let loading = $state<boolean>(true)
    
    const instrumentToSamples = {
        "drums": [
            "drums/808.wav",
            "drums/Clap.wav",
            "drums/Conga-High.wav",
            "drums/Conga-Low.wav",
            "drums/Conga-Mid.wav",
            "drums/Hihat.wav",
            "drums/Kick-Basic.wav",
            "drums/Rimshot.wav",
            "drums/Snare-Bright.wav"
        ],
        "bass": [
            'bass/bass-1.wav',
            'bass/bass-2.wav',
            'bass/bass-3.wav',
            'bass/bass-4.wav',
            'bass/bass-5.wav',
            'bass/bass-6.wav',
            'bass/bass-7.wav',
            'bass/bass-8.wav',
            'bass/bass-9.wav',
            'bass/bass-10.wav',
            'bass/bass-11.wav',
            'bass/bass-12.wav'
        ].reverse(),
        "piano": [
            'piano/piano-1.wav',
            'piano/piano-2.wav',
            'piano/piano-3.wav',
            'piano/piano-4.wav',
            'piano/piano-5.wav',
            'piano/piano-6.wav',
            'piano/piano-7.wav',
            'piano/piano-8.wav',
            'piano/piano-9.wav',
            'piano/piano-10.wav',
            'piano/piano-11.wav',
            'piano/piano-12.wav'
        ].reverse(),
        "synth": [
            'synth/synth-1.wav',
            'synth/synth-2.wav',
            'synth/synth-3.wav',
            'synth/synth-4.wav',
            'synth/synth-5.wav',
            'synth/synth-6.wav',
            'synth/synth-7.wav',
            'synth/synth-8.wav',
            'synth/synth-9.wav',
            'synth/synth-10.wav',
            'synth/synth-11.wav',
            'synth/synth-12.wav'
        ].reverse(),
    }


    let tick = $state<number>(0)

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
    
    const sequencerStyle = $derived<string[][]>($sequencerState.map((row, i) => {
        return row.map((_, j) => {
            return constructConditionalKeyStyling(
                $sequencerState[i][j], 
                tick == j, 
                blackKeyIndices.has(i), 
                j)
        })
    }))
    
    const updateSelection = (rowIndex: number, colIndex: number) => {
        $sequencerState = $sequencerState.map((row: boolean[], i) => 
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
        let interval = -1
        const run = async () => {
            loading = true
            
            // Get audio stuff
            const audioContext = new AudioContext()
            // @ts-ignore -- instrument id is supplied by another component so it should always exist on type instrumentToSamples
            const samples = instrumentToSamples[instrumentId]
            console.log(samples)
            const fetchedAudio = await Promise.all(samples.map((s: string) => fetch(`${PUBLIC_SERVER_URL}/samples/${s}`)))
            const arrayBuffers: ArrayBuffer[] = await Promise.all(fetchedAudio.map((f: Response) => f.arrayBuffer()))
            const audioBuffers = await Promise.all(arrayBuffers.map(b=>audioContext.decodeAudioData(b)))
            const sources = Array(samples.length).fill(null)

            $sequencerState = Array(sources.length).fill(Array(NUM_TIMESTEPS).fill(false))

            loading = false
            
            interval = setInterval(() => {
                tick = (tick + 1) % $sequencerState[0].length
                for (let i = 0; i < $sequencerState.length; i++) {
                    if ($sequencerState[i][tick]) {
                        if (instrumentId == "synth" || instrumentId == "bass") {
                            muteAllNotes(sources)
                        }
                        sources[i]?.stop()
                        sources[i] = audioContext.createBufferSource()
                        sources[i]!.buffer = audioBuffers[i]
                        sources[i]!.connect(audioContext.destination)
                        sources[i]!.start()
                        sources[i]!.onended = () => {
                            sources[i] = null
                        }
                    }
                }
            }, 200);
        }
        run()
        return () => clearInterval(interval)
    })
</script>

{#if loading}
    <p class="flex items-center justify-center">loading samples...</p>
{:else}
    <div id="selection grid container" class="gap-4 flex flex-col">
        {#each $sequencerState as row, rowIndex}
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