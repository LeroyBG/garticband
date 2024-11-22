<script>
    import { allFalseRoomState } from "$lib/dummyData";
    import { randomRoomState } from "$lib/dummyData";
    import FinalComposition from "$lib/components/FinalComposition.svelte";
</script>
<FinalComposition roomState={allFalseRoomState} timeSteps={32} io={null} />