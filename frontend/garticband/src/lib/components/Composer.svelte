<!--
  @component

  Composer to provide sound feedback. Helper class for Sequencer.
-->
<script lang="ts">

    const {
        sampleFileNames,
        mutuallyExclusiveNotes,
        centralAudioContext,
        ...others
    }: ComposerProps  = $props()

    import Sequencer from "./Sequencer.svelte";
    import { PUBLIC_SERVER_URL } from "$env/static/public";
    import { onMount } from "svelte";
    import { type ComposerProps  } from "$lib/types";

    let audioContext: AudioContext|null = null

    const rows = sampleFileNames.length
    const sources: (AudioBufferSourceNode|null)[] = Array(rows).fill(null)

    let initializing = $state<boolean>(true)

    const getAudioBuffers = async (audioContext: AudioContext): Promise<AudioBuffer[]> => {
        const fetchedAudio = await Promise.all(sampleFileNames.map((s)=>fetch(`${PUBLIC_SERVER_URL}/samples/${s}`)))
        const arrayBuffers: ArrayBuffer[] = await Promise.all(fetchedAudio.map((f: Response) => f.arrayBuffer()))
        return await Promise.all(arrayBuffers.map(b=>audioContext.decodeAudioData(b)))
    }

    let audioBuffers: AudioBuffer[]|null = $state(null)

    const muteAllSources = (sources: (AudioBufferSourceNode|null)[]): void => {
        for (let i = 0; i < sources.length; i++) {
            sources[i]?.stop()
            sources[i] = null
        }
    }

    // audioBuffers wont be null when this is run because we only pass this
    // function to Sequencer when the promise has been resolved
    const selectedSquareActive = (row: number) => {
        if (mutuallyExclusiveNotes)
            muteAllSources(sources)
        else if (sources[row]) {
            sources[row].stop()
            sources[row] = null
        }
        sources[row] = audioContext?.createBufferSource() ?? null
        sources[row]!.buffer = audioBuffers![row]
        sources[row]!.connect(audioContext!.destination)
        sources[row]!.onended = () => {sources[row] = null}
        sources[row]!.start()
    }

    
    onMount(async () => {
        audioContext = centralAudioContext ?? new AudioContext()
        audioBuffers =  await getAudioBuffers(audioContext)
        initializing = false
    })
</script>

{#if initializing}
    <p>loading samples...</p>
{:else}
    <Sequencer {...others} {selectedSquareActive} {rows} />
{/if}