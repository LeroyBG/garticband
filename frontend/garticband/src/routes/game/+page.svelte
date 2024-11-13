{#if roomId}
    <h2>room id: {roomId}</h2>
    <h3>active turn {roomState.activeTurn}</h3>
    <h3>completed: {roomState.isCompleted}</h3>
    <h3>players:</h3>
    {#each roomState.players as player}
        <p>- player {player.turnNumber} ({player.id})</p>
    {/each}
    
    {#if gameActive}
        {#if activeTurn}
            <SelectInstrument instrumentId={me!.sequencer!.instrumentId} timeSteps={NUM_TIMESTEPS} io={io} />
        {:else if upNext}
            <UpNext />
        {:else if alreadyWent}
            <AlreadyWent />
        {:else}
            <WaitingForPlayers />
        {/if}
    {:else}
        {#if gameFinished}
            <FinalComposition {roomState} {io} timeSteps={NUM_TIMESTEPS} />
        {:else if roomReadyToStart}
            <button 
                type="button"
                onclick={startGame}>start game</button>
        {/if}
    {/if}
    <!-- <Composer instrumentId={"drums"} /> -->
{:else}
    <p>not in a room</p>
{/if}

<script lang="ts">    
    import { page } from "$app/stores";
    import { io } from "$lib/socketConnection"

    // Import components
    import UpNext from "$lib/components/UpNext.svelte"
    import AlreadyWent from "$lib/components/AlreadyWent.svelte"
    import WaitingForPlayers from "$lib/components/WaitingForPlayers.svelte"
    import FinalComposition from "$lib/components/FinalComposition.svelte";

    // Types
    import { type playerInRoom, type roomInfo } from "$lib/types";
    import SelectInstrument from "$lib/components/SelectInstrument.svelte";

    const URLParams = $page.url.searchParams
    let roomId = $state<string|null>(null)
    let roomState = $state<roomInfo>({
        players: [],
        activeTurn: null,
        isCompleted: false
    })

    const NUM_TIMESTEPS = 32

    // Find ourself in the array
    let me = $derived<playerInRoom|null>(roomState.players.find(p => p.id == io.id) ?? null)


    let roomReadyToStart = $derived<boolean>(!roomState.activeTurn && roomState.players.length == 4)
    let gameActive = $derived<boolean>(roomState.activeTurn != null)
    let gameFinished = $derived<boolean>(roomState.isCompleted)

    let upNext = $derived<boolean|null>(
        (roomState.activeTurn && me?.turnNumber) ? 
            (roomState.activeTurn == me.turnNumber - 1) :
            null
    )

    let activeTurn = $derived<boolean|null>(
        (roomState.activeTurn && me?.turnNumber) ? 
            (roomState.activeTurn == me.turnNumber) :
            null
    )
    
    let alreadyWent = $derived<boolean|null>(
        (roomState.activeTurn && me?.turnNumber) ? 
            (roomState.activeTurn > me.turnNumber) :
            null
    )

    const startGame = () => {
        io.emit("start_game", {})
    }
    $effect(() => {
        if (!URLParams.get("id")) {
            // Something went wrong...
            return
        }
        const id = URLParams.get("id")
        io.emit("join_room", { roomId: id })


        // * * * Setup socket stuff
        io.on("room_joined", (data) => {
            roomId = data.roomId
            roomState = data.roomState
        })

        io.on("player_joined", (data) => {
            roomState = data.roomState
        })

        io.on("player_left", (data) => {
            roomState = data.roomState
        })

        io.on("game_started", (data) => {
            roomState = data.roomState
        })

        io.on("new_turn", (data) => {
            roomState = data.roomState
        })

        io.on("game_finished", (data) => {
            roomState = data.roomState
        })
        return () => io?.disconnect()
    })
</script>