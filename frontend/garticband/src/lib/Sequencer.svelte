<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { type SequencerProps } from "$lib/types";
    const { 
        rows,
        disabled,
        timeSteps,
        initialState,
        synchronizedTick,
        selectedSquareActive,
        hasBlackKeys,
        io,
    }: SequencerProps = $props()
    let sequencerState = $state<boolean[][]>(initialState ?? Array(rows).fill(Array(timeSteps).fill(false)))

    let tick = $state<number>(0)

    console.log(initialState)

    /*
                                    COL INDEX
      ROW INDEX 0       1       2       3       4       5       6       7 
        0       True    False   ...     ...     ...     ...     ...     ...
        1       False   False   ...     ...     ...     ...     ...     ...
        2       False   ...     ...     ...     ...     ...     ...     ...
        3       False   ...     ...     ...     ...     ...     ...     ...
    */
    
    const constructConditionalKeyStyling = (selected: boolean, active: boolean, black: boolean, colIndex: number): string => {
        if (active) {
            return selected ? "bg-yellow-400 border-4 border-yellow-200" : "bg-yellow-100 border-2 border-yellow-300"
        } else {
            let style = `border-2 border-${(colIndex % 4 == 0) ? "black" : "grey-500"} `
            if (selected) {
                style += (black) ? "bg-green-400" : "bg-green-200"
            } else {
                style += (black) ? "bg-gray-100" : ""
            }
            return style
        }
    }

    // Which keys should be colored black
    // Using indexing rows from the top (because of how they're created in the
    // #each statement) using 0-based indexing 
    const blackKeyIndices = new Set(hasBlackKeys ? [1, 3, 5, 8, 10] : [])
    
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
        if (disabled) {
            return
        }
        sequencerState = sequencerState.map((row: boolean[], i) => 
                row.map((val, j)=> 
                    (i == rowIndex && j == colIndex) ? (!val) : val
                )
            )
        // This could overwhelm the server if a bunch of ppl start spamming
        // buttons
        io?.emit("update", {
            selectionGrid: sequencerState
        })
    }

    onMount(() => {
        let interval = -1
        if (synchronizedTick === undefined) {
            interval = setInterval(() => {
                tick = (tick + 1) % timeSteps
                }, 200);
        }
        return () => clearInterval(interval)
    })

    $effect(() => {
        const trackedTick = synchronizedTick ?? tick
        for (let i = 0; i < untrack(() => sequencerState).length; i++) {
                if (untrack(() => sequencerState)[i][trackedTick]) {
                    selectedSquareActive(i)
                }
            }
    })

</script>

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
