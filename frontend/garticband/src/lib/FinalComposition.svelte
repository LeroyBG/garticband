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

    import Composer from "./Composer.svelte";

    const { roomState }: { roomState: roomInfo } = $props()

    let tick = $state<number>(0)

    let loading = $state(true)

    $effect(() => {
        let intervalId = -1
        const use = async () => {
            loading = false
            intervalId = setInterval(() => {
                tick = (tick + 1) % 32
            }, 200)
        }
        use()
    })
</script>

{#if loading}
<h1>loading...</h1>
{:else}
    <div class="flex flex-col">
        {#each roomState.players as player}
            <h3>{player.sequencer.instrumentId}</h3>
            
            <Composer
                instrumentId={player.sequencer.instrumentId}
                timeSteps={32}
                disabled={true}
                initialState={player.sequencer.selectionGrid ?? undefined}
                synchronizedTick={tick}
            />
        {/each}
    </div>
{/if}