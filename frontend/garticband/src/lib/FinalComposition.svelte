<script lang="ts">
    type playerInRoom = {
        turnNumber: number | null // null if not yet decided,
        id: string,
        sequencer: {
            selectionGrid: boolean[][] | null, // null if no instrument selected
            instrumentId: string
        },
    }

    type roomInfo = {
        players: playerInRoom[],
        activeTurn: number | null, // i.e. 1, 2, 3, 4,..., null if no active turn,
        isCompleted: boolean
    }

    import { instrumentSamples } from "$lib/instrumentSamples";
    import { sequence } from "@sveltejs/kit/hooks";
    import Composer from "./Composer.svelte";

    const { roomState }: { roomState: roomInfo } = $props()

    let loading = $state(true)

    $effect(() => {
        const use = async () => {
            loading = false

            // @ts-ignore
            console.log(roomState.players.map(p => instrumentSamples[p.sequencer.instrumentId]))
            
        }
        use()
    })
</script>

{#if loading}
<h1>loading...</h1>
{:else}
    {#each roomState.players as player}
    <h3>{player.sequencer.instrumentId}</h3>
    <Composer
        instrumentId={player.sequencer.instrumentId}
        timeSteps={player.sequencer.selectionGrid.length}
        disabled={true}
        initialState={player.sequencer.selectionGrid ?? undefined}
    />
    {/each}
{/if}