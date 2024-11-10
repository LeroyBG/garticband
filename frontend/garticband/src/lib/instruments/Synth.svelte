<script lang="ts">
    import { instrumentSamples } from "$lib/instrumentSamples";
    import { type InstrumentProps } from "$lib/types";
    import Composer from "$lib/Composer.svelte";

    const others: InstrumentProps = $props()
    const hasBlackKeys = true
    const sampleFileNames = instrumentSamples["synth"]
    const mutuallyExclusiveNotes = true
</script>

<Composer {hasBlackKeys} {sampleFileNames} {mutuallyExclusiveNotes} {...others} />