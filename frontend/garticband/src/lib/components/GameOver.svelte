<script lang="ts">
  
    import { type GameOverProps } from '../types'
    const { io }: GameOverProps = $props()

    const backLobby = () => {
        io?.emit("back_lobby", {})
    }
</script>

<div>
    <h1>You suck</h1>
    <button onclick={backLobby}>Back to Lobby</button>
</div>