<div class="w-full min-h-screen bg-gradient-to-b from-purple to-pink">
  <div class="size-24 relative top-3 left-5">
    <img src={logo} alt="logo" />
  </div>
  
    <div class="w-full h-full m-5 px-10">
        {#if roomId}
            {#if gameActive}
                {#if activeTurn}
                    <SelectInstrument 
                        instrumentId={me!.sequencer!.instrumentId} 
                        roomState={roomState}
                        curPlayer={me!.turnNumber}
                        timeSteps={timeSteps!} 
                        io={io} 
                    />
                {:else if upNext}
                    <UpNext />
                {:else if alreadyWent}
                    <AlreadyWent />
                {:else}
                    <WaitingForPlayers />
                {/if}
            <!-- ADD CASE FOR SELECT INSTRUMENT -->
            {:else if gameFinished}
                <FinalComposition {roomState} {io} timeSteps={timeSteps!} />
        
            {:else if instrumentSelectActive}
                <div class="h-full flex flex-col justify-start items-center animate-fade">
                    <h2 class="text-white font-bold text-3xl">Genre: {genre}</h2>
                    <!-- TODO: Change number of rows and cols to dynamically fit number of instruments or just use flexbox -->
                    <div class="grid grid-rows-2 grid-cols-2 w-full gap-4 flex-grow h-96 my-9">
                        <button 
                            id="drums" 
                            class="rounded-lg {takenInstruments["drums"] ? "bg-grey" : "bg-yellow"} text-white text-xl py-2 px-4 font-bold" 
                            onclick={()=>chooseInstrument("drums")}>Drum</button
                        >
                        <button 
                            id="piano" 
                            class="rounded-lg {takenInstruments["piano"] ? "bg-grey" : "bg-indigo"} text-white text-xl py-2 px-4 font-bold" 
                            onclick={()=>chooseInstrument("piano")}>Piano</button
                        >
                        <button 
                            id="synth" 
                            class="rounded-lg {takenInstruments["synth"] ? "bg-grey" : "bg-blue"} text-white text-xl py-2 px-4 font-bold" 
                            onclick={()=>chooseInstrument("synth")}>Synth</button
                        >
                        <button 
                            id="bass" 
                            class="rounded-lg {takenInstruments["bass"] ? "bg-grey" : "bg-darkred"} text-white text-xl py-2 px-4 font-bold" 
                            onclick={()=>chooseInstrument("bass")}>Bass</button
                        >
                    </div>
                    {#if instrumentDone}
                        <button 
                            class="rounded-full bg-green hover:bg-yellow py-2 px-4 font-bold w-32 text-white" 
                            onclick={startGame}>Let's GO</button
                        >
                    {/if}
                </div>
            {:else}       
                <div class="flex flex-row items-center justify-center space-x-8 translate-y-20 h-full animate-fade">
                    <div class="bg-white bg-opacity-10 rounded-lg p-4 w-96">
                        <h3 class="text-white text-center font-bold text-lg mb-4">
                            Players
                        </h3>
                        {#each roomState.players as player}
                            <div
                                class="flex items-center justify-between bg-white bg-opacity-100 p-4 rounded-lg mb-2 shadow-sm"
                            >
                                <!-- Player Avatar and Name -->
                                <div class="flex items-center space-x-4">
                                    <!-- <div
                                        class="w-10 h-10 bg-purple-200 text-purple-700 flex items-center justify-center rounded-full"
                                    >
                                        <span class="font-bold">A</span>
                                    </div> -->
                                    <img class="size-12 inline" src={playerIcon} alt="player"/>
                                    <p class="text-black font-medium">{player.name}</p>
                                    {#if player.ready}
                                        <h2 class="ml-[15px] inline">READY!</h2>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                    <!-- Buttons Section -->
                    <div class="flex flex-col space-y-6 items-center justify-center">
                        <!-- Copy ID Button -->
                        <button
                            class="rounded-full bg-beige hover:bg-darkbeige py-2 px-4 font-bold"
                            onclick={copyID}
                        >
                            Copy ID
                        </button>
                        <!-- Ready Button -->
                        <button
                            class={`rounded-full py-2 px-4 font-bold ${
                                fullLobby
                                ? "bg-lightgreen text-white hover:bg-green"
                                : "bg-grey text-white cursor-not-allowed"
                            }`}
                            type="button"
                            onclick={fullLobby ? changeReady : null}
                            disabled={!fullLobby}
                        >
                            Ready
                        </button>

                        <!-- Start Game Button -->
                        <button
                            class={`rounded-full py-2 px-4 font-bold ${
                                roomReadyToStart
                                ? "bg-lightgreen text-white hover:bg-green"
                                : "bg-grey text-white cursor-not-allowed"
                            }`}
                            type="button"
                            onclick={roomReadyToStart ? startSelect : null}
                            disabled={!roomReadyToStart}
                        >
                            Start Game
                        </button>

                        <!-- Leave Button -->
                        <a
                            class="bg-lightred hover:bg-darkred py-2 px-4 font-bold rounded-full"
                            href="/"
                        >
                        Leave
                        </a>
                    </div>
                </div>
            {/if}
            <!-- <Composer instrumentId={"drums"} /> -->
        {:else}
            <p>not in a room</p>
        {/if}
    </div>
</div>

<script lang="ts">
    import { page } from "$app/stores";
    import { io } from "$lib/socketConnection";
    import logo from "$lib/images/garticband.png";
    import playerIcon from "$lib/images/artist.png";
    import { browser } from "$app/environment";
  
    // Import components
    import UpNext from "$lib/components/UpNext.svelte";
    import AlreadyWent from "$lib/components/AlreadyWent.svelte";
    import WaitingForPlayers from "$lib/components/WaitingForPlayers.svelte";
    import FinalComposition from "$lib/components/FinalComposition.svelte";

    // Types
    import { type playerInRoom, type roomInfo, type instrumentId } from "$lib/types";
    import SelectInstrument from "$lib/components/SelectInstrument.svelte";
  
    // Name of user
    let username = "";
    if (browser) {
      username = localStorage.getItem("username") || "No Name";
    }
  
    const URLParams = $page.url.searchParams;
    let roomId = $state<string | null>(null);
    let roomState = $state<roomInfo>({
        players: [],
        selectPhase: false,
        activeTurn: null,
        isCompleted: false,
        gameOver: false,
        sequencerTimeSteps: 0,
        previewDuration: 0
    })

    let takenInstruments = $state({
        "drums": false,
        "piano": false,
        "synth": false,
        "bass": false
    })

    let genre = $state<string|null>("")
    let fullLobby = $state<boolean|null>(false)

    // Find ourself in the array
    let me = $derived<playerInRoom|null>(roomState?.players?.find(p => p.id == io.id) ?? null)

    let instrumentSelectActive = $derived<boolean>(roomState.selectPhase == true)
    let instrumentDone = $derived<boolean>(Object.values(takenInstruments).every(value => value === true))
    
    let roomReadyToStart = $derived<boolean>(!roomState.activeTurn && roomState.players.length == 4 && roomState.players.every(p => p.ready === true))
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

    let timeSteps = $derived<number|null>(
        roomState.sequencerTimeSteps ?? null
    )

    const changeReady = () => {
        io.emit("change_ready", {})
    }

    const startSelect = () => {
      io.emit("start_select", {});
    };
  
    const chooseInstrument = (id: instrumentId) => {
      // add a check where it only does this if we don't have an instrument selected
      if (
        me?.sequencer.instrumentId == null &&
        takenInstruments[id] == false
      ) {
        io.emit("choose_instrument", {id: id});
      }
    };
  
    const startGame = () => {
      io.emit("start_game", {});
    };
    $effect(() => {
        if (!URLParams.get("id")) {
            // Something went wrong...
            return
        }
        const id = URLParams.get("id")
        io.emit("join_room", { roomId: id, name: username })


        // * * * Setup socket stuff
        io.on("room_joined", (data) => {
            console.log("Room was successfully joined by a player on the server side with the following data:")
            console.log(data)
            roomId = data.roomId
            roomState = data.roomState
            fullLobby = data.fullLobby
        })

        io.on("player_joined", (data) => {
            console.log("Room was successfully joined by another player on the server side and notifying all clients in the same room")
            console.log(data)
            roomState = data.roomState
            fullLobby = data.fullLobby
        })

        io.on("player_left", (data) => {
            console.log("Some player has left and roomState was updated in server:")
            console.log(data)
            roomState = data.roomState
            fullLobby = data.fullLobby
        })

        io.on("notify_ready", (data) => {
            console.log("Ready status was changed for player" )
            console.log(data.roomState)
            roomState = data.roomState
        })

        io.on("select_started", (data) => {
            console.log("Server successfully initiated instrument select mode with according changes to roomState:")
            console.log(data)
            roomState = data.roomState
            genre = data.genre
            fullLobby = data.fullLobby
        })

        io.on("update_instrument", 
                ({newRoomState, instrument}: {newRoomState: roomInfo, instrument: instrumentId}) => {
            console.log("Player " + username + " successfully chose " + instrument)
            console.log(newRoomState)
            roomState = newRoomState
            takenInstruments[instrument] = true
        })

        io.on("game_started", (data) => {
            console.log("Server successfully transitioning game from instrument select to composing phase")
            console.log(data.roomState)
            roomState = data.roomState
        })

        io.on("new_turn", (data) => {
            console.log("Server successfully transitioned to next player's turn")
            console.log(data.roomState)
            roomState = data.roomState
        })

        io.on("game_finished", (data) => {
            console.log("All players turns done and server transitioned to final composition page")
            console.log(data.roomState)
            roomState = data.roomState
        })

        io.on("game_over", (data) => {
            console.log("Server successfully changed all player's ready status to false after game is over")
            console.log(data.roomState)
            roomState = data.roomState
            Object.keys(takenInstruments).forEach(key => {
                takenInstruments[key as keyof typeof takenInstruments] = false
            })
        })

        io.on("update_lobby", (data) => {
            console.log("Server successfully reset all sequencers and notify players that everyone is in the lobby")
            fullLobby = data.fullLobby
        })

        io.on("reset", (data) => {
            console.log("Server successfully changed game state back to lobby mode for designated player that pressed Back to Lobby")
            console.log(data.roomState)
            roomState = data.roomState
        })

        return () => io?.disconnect()
    })

    function copyID() {
      var copyText = roomId !== null ? roomId : "None";
      navigator.clipboard.writeText(copyText);
    }

    $inspect(takenInstruments)
    $inspect(me)
</script>