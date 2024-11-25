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
  import { type playerInRoom, type roomInfo } from "$lib/types";
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
  });

  let takenInstruments = $state({
    drums: false,
    piano: false,
    synth: false,
    bass: false,
  });

  let genre = $state<string | null>("");

  const NUM_TIMESTEPS = 32;

  // Find ourself in the array
  let me = $derived<playerInRoom | null>(
    roomState.players.find((p) => p.id == io.id) ?? null
  );

  let instrumentSelectActive = $derived<boolean>(roomState.selectPhase == true);
  let instrumentDone = $derived<boolean>(
    Object.values(takenInstruments).every((value) => value === true)
  );

  let roomReadyToStart = $derived<boolean>(
    !roomState.activeTurn && roomState.players.length == 4
  );
  let gameActive = $derived<boolean>(roomState.activeTurn != null);
  let gameFinished = $derived<boolean>(roomState.isCompleted);

  let upNext = $derived<boolean | null>(
    roomState.activeTurn && me?.turnNumber
      ? roomState.activeTurn == me.turnNumber - 1
      : null
  );

  let activeTurn = $derived<boolean | null>(
    roomState.activeTurn && me?.turnNumber
      ? roomState.activeTurn == me.turnNumber
      : null
  );

  let alreadyWent = $derived<boolean | null>(
    roomState.activeTurn && me?.turnNumber
      ? roomState.activeTurn > me.turnNumber
      : null
  );

  const startSelect = () => {
    io.emit("start_select", {});
  };

  const chooseDrum = () => {
    // add a check where it only does this if we don't have an instrument selected
    if (
      me?.sequencer.instrumentId == null &&
      takenInstruments["drums"] == false
    ) {
      io.emit("choose_drum", {});
    }
  };
  // add other instrument selections
  const chooseSynth = () => {
    // add a check where it only does this if we don't have an instrument selected
    if (
      me?.sequencer.instrumentId == null &&
      takenInstruments["synth"] == false
    ) {
      io.emit("choose_synth", {});
    }
  };

  const chooseBass = () => {
    // add a check where it only does this if we don't have an instrument selected
    if (
      me?.sequencer.instrumentId == null &&
      takenInstruments["bass"] == false
    ) {
      io.emit("choose_bass", {});
    }
  };

  const choosePiano = () => {
    // add a check where it only does this if we don't have an instrument selected
    if (
      me?.sequencer.instrumentId == null &&
      takenInstruments["piano"] == false
    ) {
      io.emit("choose_piano", {});
    }
  };

  const startGame = () => {
    io.emit("start_game", {});
  };
  $effect(() => {
    if (!URLParams.get("id")) {
      // Something went wrong...
      return;
    }
    const id = URLParams.get("id");
    io.emit("join_room", { roomId: id, name: username });

    // * * * Setup socket stuff
    io.on("room_joined", (data) => {
      roomId = data.roomId;
      roomState = data.roomState;
    });

    io.on("player_joined", (data) => {
      roomState = data.roomState;
    });

    io.on("player_left", (data) => {
      roomState = data.roomState;
    });

    io.on("select_started", (data) => {
      roomState = data.roomState;
      genre = data.genre;
    });

    io.on("update_instrument", (data) => {
      roomState = data.roomState;
      takenInstruments[data.instrument as keyof typeof takenInstruments] = true;
      var btn = document.querySelector("#" + data.instrument);
      btn?.classList.add("bg-grey");
    });

    io.on("game_started", (data) => {
      roomState = data.roomState;
    });

    io.on("new_turn", (data) => {
      roomState = data.roomState;
    });

    io.on("game_finished", (data) => {
      roomState = data.roomState;
    });
    return () => io?.disconnect();
  });

  function copyID() {
    var copyText = roomId !== null ? roomId : "None";
    navigator.clipboard.writeText(copyText);
  }
</script>

<div class="h-full bg-gradient-to-b from-purple to-pink">
  <div class="size-24 relative top-3 left-5">
    <img src={logo} alt="logo" />
  </div>

  <div class="w-full m-5">
    {#if roomId}
      {#if gameActive}
        <h3>active turn {roomState.activeTurn}</h3>
        <h3>completed: {roomState.isCompleted}</h3>
        {#if activeTurn}
          <SelectInstrument
            instrumentId={me!.sequencer!.instrumentId}
            timeSteps={NUM_TIMESTEPS}
            {io}
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
        <FinalComposition {roomState} {io} timeSteps={NUM_TIMESTEPS} />
      {:else if instrumentSelectActive}
        <h2>{genre}</h2>
        <button
          id="drums"
          class="rounded-full bg-beige py-2 px-4 font-bold"
          onclick={chooseDrum}>Drum</button
        >
        <button
          id="piano"
          class="rounded-full bg-indigo py-2 px-4 font-bold"
          onclick={choosePiano}>Piano</button
        >
        <button
          id="synth"
          class="rounded-full bg-blue py-2 px-4 font-bold"
          onclick={chooseSynth}>Synth</button
        >
        <button
          id="bass"
          class="rounded-full bg-darkred py-2 px-4 font-bold"
          onclick={chooseBass}>Bass</button
        >
        {#if instrumentDone}
          <button
            class="rounded-full bg-beige hover:bg-darkbeige py-2 px-4 font-bold"
            onclick={startGame}>Let's GO</button
          >
        {/if}
      {:else}
        <!-- Copy ID Button -->
        <button
          class="rounded-full bg-beige hover:bg-darkbeige py-2 px-4 font-bold"
          onclick={copyID}
        >
          Copy ID
        </button>

        <!-- Layout: Players List and Buttons Side-by-Side -->
        <div class="flex flex-row items-center justify-center space-x-8 h-full">
          <!-- Players List -->
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
                  <div
                    class="w-10 h-10 bg-purple-200 text-purple-700 flex items-center justify-center rounded-full"
                  >
                    <span class="font-bold">A</span>
                  </div>
                  <p class="text-black font-medium">{player.name}</p>
                </div>
                <!-- Check Icon -->
                <div
                  class="w-6 h-6 bg-purple-600 flex items-center justify-center rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="white"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            {/each}
          </div>

          <!-- Buttons Section -->
          <div class="flex flex-col space-y-6 items-center justify-center">
            <!-- Start Game Button -->
            <button
              class={`rounded-full py-2 px-4 font-bold ${
                roomReadyToStart
                  ? "bg-beige text-black hover:bg-darkbeige"
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
