<!--
  @component

  Page to show players when they are not next to compose (2, 3, 4 turns away from composition)
-->
<!-- Display when you're waiting for other players AND you're not next up-->
<div class="flex flex-col flex-1 items-center justify-center animate-fade">
    <h1 class="text-5xl font-bold text-white mt-40 animate-bounce">
        Waiting for the players before you to finish their composition
    </h1>
    <img src={cookie} alt="waiting img" class="mt-10"/>
</div>

<script>
    import cookie from "$lib/images/cookiemonster.gif";
</script>