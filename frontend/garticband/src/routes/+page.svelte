<div class="h-full flex flex-col justify-center items-center">
    <div class="text-purple-800 flex flex-col items-center justify-center gap-3">
    <h1 class=" text-purple-600">garticband</h1>
        <div><a href={createGamePageURL}>create game</a></div>
        <div>
            {#if !validGameId}
            join game --&gt; 
            {:else}
            <a href={joinGamePageURL}
                class="bg-purple-600 text-white border-r-1 rounded-md p-1"
                >join game
            </a> &lt--
            {/if}
            <input placeholder="game id" 
                class="placeholder:text-center w-20 text-green-500 text-center"
                bind:value={gameIdInput}
                />
        </div>
    </div>
</div>

<script lang="ts">
    let gameIdInput = $state<string>("");
    const gamePageURL = "/game"
    let createGamePageURL = $state("")

    // TODO: get this to run at server with node:crypto module
    $effect(() => {
        createGamePageURL = gamePageURL + '?' + new URLSearchParams({
            "id": crypto.randomUUID()
        }).toString()
    })

    const joinGamePageURL = $derived(gamePageURL + '?' + new URLSearchParams({
        "id": gameIdInput
    }))

    const validateGameId = (id: string): boolean => {
        // TODO: Actually validate gameId
        return true
    }

    let validGameId = $derived(validateGameId(gameIdInput))
</script>