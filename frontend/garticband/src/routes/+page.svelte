<script lang="ts">
  import logo from "$lib/images/garticband.png";

  let gameIdInput = $state<string>("");
  let playerName = $state<string>("");
  const gamePageURL = "/game";
  let createGamePageURL = $state("");

  function passName() {
    let username = playerName;
    localStorage.setItem('username', username);
  }

  $effect(() => {
    createGamePageURL =
      gamePageURL +
      "?" +
      new URLSearchParams({
        id: crypto.randomUUID(),
      }).toString();
  });

  const joinGamePageURL = $derived(
    gamePageURL +
      "?" +
      new URLSearchParams({
        id: gameIdInput,
      })
  );

  const validateGameId = (id: string): boolean => {
    return true;
  };

  let validGameId = $derived(validateGameId(gameIdInput));
</script>

<div class="h-full flex bg-gradient-to-b from-purple to-pink">
  <div class="flex-1 flex justify-center items-center">
    <img src={logo} alt="logo" class="w-2/5" />
  </div>
  <div
    class="flex-1 flex flex-col items-center justify-center gap-4 text-center"
  >
    <input
      placeholder="Enter Name"
      class="placeholder:text-center w-80 text-green-500 text-center border p-2 rounded-md"
      bind:value={playerName}
    />
    <input
      placeholder="Enter Room ID"
      class="placeholder:text-center w-80 text-green-500 text-center border p-2 rounded-md"
      bind:value={gameIdInput}
    />

    <div class="bg-beige p-2 rounded-md text-xl w-40">
      <a href={createGamePageURL} onclick={passName}>Create Game</a>
    </div>
    <div class="bg-lightred p-2 rounded-md text-xl w-40">
      {#if !validGameId}
        join game --&gt;
      {:else}
        <a
          href={joinGamePageURL}
          class="bg-purple-600 text-white rounded-md p-1"
          onclick={passName}
        >
          Join Game
        </a>
      {/if}
    </div>
  </div>
</div>
