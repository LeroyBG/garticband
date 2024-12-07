<!--
  @component

  2D boolean array where each row is mapped to a sound, each column is mapped to a different tone. Sounds played by row and pitch determined by column.
-->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { type SequencerProps } from "$lib/types";
  import SequencerButton from "./SequencerButton.svelte";
  const {
    rows,
    disabled,
    timeSteps,
    initialState,
    synchronizedTick,
    selectedSquareActive,
    hasBlackKeys,
    io,
    sampleIconSources,
  }: SequencerProps = $props();
  let sequencerState = $state<boolean[][]>(
    initialState ?? Array(rows).fill(Array(timeSteps).fill(false))
  );

  let tick = $state<number>(0);

  /*
                                    COL INDEX
      ROW INDEX 0       1       2       3       4       5       6       7 
        0       True    False   ...     ...     ...     ...     ...     ...
        1       False   False   ...     ...     ...     ...     ...     ...
        2       False   ...     ...     ...     ...     ...     ...     ...
        3       False   ...     ...     ...     ...     ...     ...     ...
    */

  // Which keys should be colored black
  // Using indexing rows from the top (because of how they're created in the
  // #each statement) using 0-based indexing
  const blackKeyIndices = new Set(hasBlackKeys ? [1, 3, 5, 8, 10] : []);

  const updateSelection = (rowIndex: number, colIndex: number) => {
    if (disabled) {
      return;
    }
    sequencerState = sequencerState.map((row: boolean[], i) =>
      row.map((val, j) => (i == rowIndex && j == colIndex ? !val : val))
    );
    // This could overwhelm the server if a bunch of ppl start spamming
    // buttons
    io?.emit("update", {
      selectionGrid: sequencerState,
    });
  };

  onMount(() => {
    let interval = -1;
    if (synchronizedTick === undefined) {
      interval = setInterval(() => {
        tick = (tick + 1) % timeSteps;
      }, 200);
    }
    return () => clearInterval(interval);
  });

  $effect(() => {
    tick = synchronizedTick ?? tick;
    for (let i = 0; i < untrack(() => sequencerState).length; i++) {
      if (untrack(() => sequencerState)[i][tick]) {
        selectedSquareActive(i);
      }
    }
  });
</script>

<div
  id="selection grid container"
  class="gap-2 flex flex-col bg-darkgrey p-2 rounded-sm"
>
  {#each sequencerState as row, rowIndex}
    <div class="flex flex-row justify-between">
      {#if sampleIconSources}
        <img
          src={sampleIconSources[rowIndex]}
          alt="sample icon"
          class="h-9 w-9"
          style="filter: invert(1);"
        />
      {/if}
      {#each row as _, colIndex}
        <div
          id="sequencerbutton-wrapper"
          class={"h-9 w-9 " +
            (colIndex % 4 == 0 && colIndex != 0 ? "ml-2" : "")}
        >
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <SequencerButton
            onclick={() => updateSelection(rowIndex, colIndex)}
            isActive={colIndex == tick}
            isBlackKey={blackKeyIndices.has(rowIndex)}
            isSelected={sequencerState[rowIndex][colIndex]}
          ></SequencerButton>
        </div>
      {/each}
    </div>
  {/each}
</div>
