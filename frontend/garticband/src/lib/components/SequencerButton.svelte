<!--
  @component

  One interactive button on the music composition sequencer. 
-->
<script lang="ts">
    import type { SequencerButtonProps } from "$lib/types";

    const { isBlackKey, isSelected, isActive, onclick }: SequencerButtonProps = $props()

    // Background color can be affected by whether it's a black key, if it's selected or not, if it's active
    // Hot pink for black keys
    // Nice purple for regular keys

    // Selected purple key
    // #9656FF
    // #7E4AD5

    // Un selected purple key
    // #32244B

    // Selected pink key
    // #D720AA
    // #AD1B8A

    // Un selected pink key
    // #45193C

    let tailwindStyle = $derived(
        (isActive ? "border border-solid border-white" : "") + " " + 
            (isSelected ? "" : (isBlackKey ? "bg-sequencerButtonPink" : "bg-sequencerButtonPurple"))
    )

    let vanillaStyle = $derived(
        isSelected ? ("background: radial-gradient" + (isBlackKey ? "(#D720AA, #AD1B8A);" : "(#9656FF, #7E4AD5);")) : ""
    )
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button type="button" 
    {onclick}
    class="h-full w-full rounded-sm {tailwindStyle}"
    style={vanillaStyle}
></button>