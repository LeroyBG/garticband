{#if roomId}
<h2>room id: {roomId}</h2>
<h3>active turn {roomState.activeTurn}</h3>
<h3>completed: {roomState.isCompleted}</h3>
<h3>players:</h3>
{#each roomState.players as player}
    <p>- player {player.turnNumber} ({player.id})</p>
{/each}
{:else}
<p>not in a room</p>
{/if}

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
    import { page } from "$app/stores";
    import { io } from "$lib/socketConnection"

    const URLParams = $page.url.searchParams
    let roomId = $state<string|null>(null)
    let roomState = $state<roomInfo>({
        players: [],
        activeTurn: null,
        isCompleted: false
    })

    
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
        return () => io?.disconnect()
    })
</script>