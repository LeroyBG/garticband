<script lang="ts">
    import SelectInstrument from "$lib/SelectInstrument.svelte";
    import { onMount } from "svelte";
    import type { FinalCompositionProps } from '$lib/types'

    const { roomState, timeSteps, ...others }: FinalCompositionProps = $props()

    let tick = $state<number>(0)

    const centralAudioContext = new AudioContext()

    onMount(() => {
        let intervalId = setInterval(() => {
                tick = (tick + 1) % timeSteps
            }, 200)
        return () => clearInterval(intervalId)
    })

    $inspect("final room state", roomState)

</script>

<div class="flex flex-col">
    {#each roomState.players as player}
        <h3>{player.sequencer.instrumentId}</h3>
        
        <SelectInstrument
            instrumentId={player.sequencer.instrumentId}
            disabled={true}
            initialState={player.sequencer.selectionGrid ?? undefined}
            synchronizedTick={tick}
            {centralAudioContext}
            {timeSteps}
            {...others}
        
        />
    {/each}
</div>