<script lang="ts">
    import { instrumentSamples } from "$lib/instrumentSamples";
    import { type InstrumentProps } from "$lib/types";
    import Composer from "$lib/Composer.svelte";

    const others: InstrumentProps = $props()
    const hasBlackKeys = false
    const sampleFileNames = instrumentSamples["drums"]
    const mutuallyExclusiveNotes = false
</script>

<Composer {hasBlackKeys} {sampleFileNames} {mutuallyExclusiveNotes} {...others} />