<script lang="ts">
  import { type GameOverProps } from "../types";
  const { io }: GameOverProps = $props();

  const backLobby = () => {
    io?.emit("back_lobby", {});
  };
</script>

<div class="flex flex-col flex-1 items-center justify-center animate-fade">
  <h1 class="text-6xl font-bold text-white mt-40">You suck</h1>
  <button
    class="bg-blue-500 text-black font-medium px-4 py-2 rounded-md mt-8 bg-beige shadow-lg shadow-black hover:shadow-lg hover:shadow-beige/30"
    onclick={backLobby}>Back to Lobby</button
  >
</div>
