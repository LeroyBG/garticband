import { writable } from "svelte/store";

export const sequencerState = writable<boolean[][]>(
    []
)