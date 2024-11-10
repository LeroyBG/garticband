<script lang="ts">
    import Drums from '$lib/instruments/Drums.svelte'
    import Bass from '$lib/instruments/Bass.svelte'
    import Piano from '$lib/instruments/Piano.svelte'
    import Synth from '$lib/instruments/Synth.svelte'

    import { type SelectInstrumentProps } from './types'

    const { instrumentId, ...others }: SelectInstrumentProps = $props()
</script>
<!-- ----- SELECT A SEQUENCER TO USE BASED ON SERVER DATA ---- -->

{#if instrumentId == "drums"}
    <Drums {...others} />
{:else if instrumentId == "piano"}
    <Piano {...others} />
{:else if instrumentId == "bass"}
    <Bass {...others} />
{:else }
    <Synth {...others} />
{/if}