<script lang="ts">
    import SelectInstrument from "$lib/components/SelectInstrument.svelte";
    import { onMount } from "svelte";
    import type { FinalCompositionProps } from '$lib/types'

    const { roomState, timeSteps, ...others }: FinalCompositionProps = $props()

    let tick = $state<number>(0)
    let progress = $state<number>(0);
    let loading = $state<boolean>(true)

    const centralAudioContext = new AudioContext()

    onMount(() => {
        const interval = 50; // Update every 50ms
        const increment = 1;

        const timer = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(timer); // Stop updating once complete
                setTimeout(() => {
                    loading = false
                    playFinal();
                }, 1000);
            }
        }, interval);   
    })

    const playFinal = () => {
        let intervalId = setInterval(() => {
                tick = (tick + 1) % timeSteps
            }, 200)
        return () => clearInterval(intervalId)
    }

    $inspect("final room state", roomState)

</script>

<div>
    {#if loading}
        <div class="flex flex-col items-center justify-center translate-y-60 space-y-4">
            <h1 class="text-white text-center font-bold text-lg animate-bounce">Combining your music...</h1>
            <div class="w-[800px] bg-grey rounded-full overflow-hidden border border-white">
                <div 
                    class="h-6 bg-green transition-all ease-linear" 
                    style="width: {progress}%;">
                </div>
            </div>
        </div>
    {:else}
        {#each roomState.players as player}
            <h3>{player.sequencer.instrumentId}</h3>
            
            <SelectInstrument
                instrumentId={player.sequencer.instrumentId}
                roomState={roomState}
                curPlayer={1}
                disabled={true}
                initialState={player.sequencer.selectionGrid ?? undefined}
                synchronizedTick={tick}
                {centralAudioContext}
                {timeSteps}
                {...others}
            
            />
        {/each}
    {/if}
    
</div>