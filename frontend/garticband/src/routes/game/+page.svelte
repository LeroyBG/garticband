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
            <Composer 
                timeSteps={32}
                instrumentId={roomState.players.find(p => p.id == io.id)?.sequencer.instrumentId} 
            />
        {:else if upNext}
            <UpNext />
        {:else if alreadyWent}
            <AlreadyWent />
        {:else}
            <WaitingForPlayers />
        {/if}
    {:else}
        {#if gameFinished}
            <FinalComposition roomState={roomState} />
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
    import Composer from "$lib/Composer.svelte";
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
    import { page } from "$app/stores";
    import { io } from "$lib/socketConnection"

    // Import components
    import UpNext from "$lib/UpNext.svelte"
    import AlreadyWent from "$lib/AlreadyWent.svelte"
    import WaitingForPlayers from "$lib/WaitingForPlayers.svelte"
    import FinalComposition from "$lib/FinalComposition.svelte";


    const URLParams = $page.url.searchParams
    let roomId = $state<string|null>(null)
    let roomState = $state<roomInfo>({
        players: [],
        activeTurn: null,
        isCompleted: false
    })

    // Find ourself in the array
    let myTurnNumber = $derived<number|null>(roomState.players.find(p => p.id == io.id)?.turnNumber ?? null)

    let roomReadyToStart = $derived<boolean>(!roomState.activeTurn && roomState.players.length == 4)
    let gameActive = $derived<boolean>(roomState.activeTurn != null)
    let gameFinished = $derived<boolean>(roomState.isCompleted)

    let upNext = $derived<boolean|null>(
        (roomState.activeTurn && myTurnNumber) ? 
            (roomState.activeTurn == myTurnNumber - 1) :
            null
    )

    let activeTurn = $derived<boolean|null>(
        (roomState.activeTurn && myTurnNumber) ? 
            (roomState.activeTurn == myTurnNumber) :
            null
    )
    
    let alreadyWent = $derived<boolean|null>(
        (roomState.activeTurn && myTurnNumber) ? 
            (roomState.activeTurn > myTurnNumber) :
            null
    )

    const startGame = () => {
        io.emit("start_game", {})
    }
    $inspect(roomState)
    $effect(() => {
        if (!URLParams.get("id")) {
            // Something went wrong...
            return
        }
        const id = URLParams.get("id")
        console.log("trying to join a room")
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