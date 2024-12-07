<!--
  @component

  Page for next player to see when getting ready for composition
-->
<!-- Display when you're the next to compose -->
<div class="flex flex-col flex-1 items-center justify-center animate-fade">
    <h1 class="text-5xl font-bold text-white mt-40 animate-bounce">
        Get ready! You're up next
    </h1>
    <img src={patrick} alt="upnext img" class="mt-8"/>
</div>

<script>
    import patrick from "$lib/images/patrick.gif";
</script>