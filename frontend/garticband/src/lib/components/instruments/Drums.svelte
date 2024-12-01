<script lang="ts">
    import { instrumentSamples } from "$lib/instrumentSamples";
    import { type InstrumentProps } from "$lib/types";
    import Composer from "$lib/components/Composer.svelte";

    const others: InstrumentProps = $props()
    const hasBlackKeys = false
    const sampleFileNames = instrumentSamples["drums"]
    const mutuallyExclusiveNotes = false

    const sampleIconSources = [
        "bass-wave.png", "clap.png", "tom.png", "tom.png", "tom.png", "hi-hat.png", "bass-drum.png", "drumsticks.png", "snare.png"
    ].map(n => "http://localhost:3000/icons/drums/" + n)
</script>

<Composer {hasBlackKeys} {sampleFileNames} {mutuallyExclusiveNotes} {sampleIconSources} {...others} />
