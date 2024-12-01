<script lang="ts">
    import Drums from '$lib/components/instruments/Drums.svelte'
    import Bass from '$lib/components/instruments/Bass.svelte'
    import Piano from '$lib/components/instruments/Piano.svelte'
    import Synth from '$lib/components/instruments/Synth.svelte'
    import SelectInstrument from "$lib/components/SelectInstrument.svelte";
    import { onMount } from 'svelte';

    import { type SelectInstrumentProps } from '../types'

    const { instrumentId, roomState, curPlayer, timeSteps, ...others }: SelectInstrumentProps = $props()

    let isPreview = $state<number>(curPlayer!)
    let tick = $state<number>(0)
    const centralAudioContext = new AudioContext()
    

    onMount(() => {
        if (isPreview > 1) {
            let intervalId = setInterval(() => {
                    tick = (tick + 1) % timeSteps
                }, 200)

                setTimeout(() => {
                    clearInterval(intervalId)
                    isPreview = 1
                }, 10000);
        }
    });

</script>
<!-- ----- SELECT A SEQUENCER TO USE BASED ON SERVER DATA ---- -->
<!--This has a bug if someone leaves midway in the game-->
{#if isPreview > 1}
    {@const player = roomState.players[curPlayer!-2]}
    <div class="animate-fade">
        <h1 class="text-white text-center font-bold text-lg animate-bounce">PREVIEW</h1>
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
    </div>

    

{:else}
<div class="animate-fade">
    {#if instrumentId == "drums"}
    <Drums {timeSteps} {...others} />
    {:else if instrumentId == "piano"}
    <Piano {timeSteps} {...others} />
    {:else if instrumentId == "bass"}
    <Bass {timeSteps} {...others} />
    {:else }
    <Synth {timeSteps} {...others} />
    {/if}
</div>
    
{/if}

