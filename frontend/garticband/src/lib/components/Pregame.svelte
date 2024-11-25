<script lang="ts">
    import { type SelectProps } from "$lib/types";
    const { io, instrumentId }: SelectProps = $props()
    // need to pass roomState?

    let takenInstruments = $state({
        "drums": false,
        "piano": false,
        "synth": false,
        "bass": false
    })

    const startSelect = () => {
        io?.emit("start_select", {})
    }

    const chooseDrum = () => {
        // add a check where it only does this if we don't have an instrument selected
        if (instrumentId == null && takenInstruments["drums"] == false) {
            io?.emit("choose_drum", {}) 
        } 
    }
    // add other instrument selections
    const chooseSynth = () => {
        // add a check where it only does this if we don't have an instrument selected
        if (instrumentId == null && takenInstruments["synth"] == false) {
            io?.emit("choose_synth", {}) 
        } 
    }

    const chooseBass = () => {
        // add a check where it only does this if we don't have an instrument selected
        if (instrumentId == null && takenInstruments["bass"] == false) {
            io?.emit("choose_bass", {}) 
        } 
    }

    const choosePiano = () => {
        // add a check where it only does this if we don't have an instrument selected
        if (instrumentId == null && takenInstruments["piano"] == false) {
            io?.emit("choose_piano", {}) 
        } 
    }

</script>

<div>
    <button>Drum</button>
    <button>Synth</button>
    <button>Bass</button>
    <button>Piano</button>
</div>
