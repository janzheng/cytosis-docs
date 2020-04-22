<svelte:options accessors/>

<main class="Demos _card __outline _padding-2">

  <h5 class="_font-bold">Basic Cytosis Examples</h5>
  <ul class="demo-list _margin-bottom-2">
    {#each Object.keys(basicDemos) as demo}
      <li><a class={ isActive(demo) } href="/demos/{demo}">{ basicDemos[demo].title }</a> — { basicDemos[demo].description }</li>
    {/each}
  </ul>


  <h5 class="_font-bold">Write-capable Examples</h5>
  <ul class="demo-list _margin-bottom-2">
    {#each Object.keys(writeDemos) as demo}
      <li><a class={ isActive(demo) } href="/demos/{demo}">{ writeDemos[demo].title }</a> — { writeDemos[demo].description }</li>
    {/each}
  </ul>



</main>




<script>
  import { cytosis, makers, dropoff, content } from '../stores.js';

  import DemoOne from '../examples/DemoOne.svelte'
  import DemoTwo from '../examples/DemoTwo.svelte'
  import DemoThree from '../examples/DemoThree.svelte'
  import DemoFour from '../examples/DemoFour.svelte'
  import DemoFive from '../examples/DemoFive.svelte'
  import DemoSix from '../examples/DemoSix.svelte'
  import DemoSeven from '../examples/DemoSeven.svelte'
  import DemoEight from '../examples/DemoEight.svelte'
  import DemoNine from '../examples/DemoNine.svelte'
  import DemoTen from '../examples/DemoTen.svelte'
  import DemoEleven from '../examples/DemoEleven.svelte'

  import DemoSandbox from '../examples/DemoSandbox.svelte'

  export let demoName

  $: isActive = str => demoName === str ? 'selected' : '';

  export let basicDemos = {
    'demoOne': {name: "Demo One", component: DemoOne, title: "1. Basics", description: "This demo retrieves a table from the given Base, by reading a record in '_cytosis'"},
    'demoTwo': {name: "Demo Two", component: DemoTwo, title: "2. Get a table of items", description: "This demo retrieves a ton of items from the Items Table in a non-paginated manner"},
    'demoThree': {name: "Demo Three", component: DemoThree, title: "3. Get a table of items in a paginated way", description: "This demo shows how to use 'getPageTable'"},
    'demoFour': {name: "Demo Four", component: DemoFour, title: "4. Config & data reload/refresh", description: "This is how to use custom configs and tables without needing a '_cytosis' table"},
    'demoFive': {name: "Demo Five", component: DemoFive, title: "5. Bypassing config and directly setting your bases ", description: "This demo shows how to completely bypass config, to speed up loading"},
    'demoSix': {name: "Demo Six", component: DemoSix, title: "6. Caching strategies", description: "This demo shows how localStorage, browser-based cache helpers work."},
    'demoSeven': {name: "Demo Seven", component: DemoSeven, title: "7. Views, filtering, sorting, and fields", description: "This demo shows how to take advantage of the Airtable API and Cytosis' views, filtering, sorting, and fields mechanisms."},
    'demoEight': {name: "Demo Eight", component: DemoEight, title: "8. Search", description: "This demo shows how to use cytosis to search and retrieve from Airtable."},
    'demoNine': {name: "Demo Nine", component: DemoNine, title: "9. Linked Queries", description: "This demo shows how combine queries into a single query in config. This is really useful for splitting and creating complex, fine-grained queries."},
    'demoTen': {name: "Demo Ten", component: DemoTen, title: "10. Multiple Airtables", description: "This demo shows to combine multiple bases into one Cytosis."},

    'sandbox': {name: "Sandbox", component: DemoSandbox, title: "Sandbox", description: "This is a sandbox. Have fun!"},
  }


  export let writeDemos = {
    'demoEleven': {name: "Demo Eleven", component: DemoEleven, title: "11. Saving to Cytosis", description: "This demo shows how to use a form to save directly to Cytosis."},
  }


  // combines the different demos for the Demos component
  export let demos = {...basicDemos, ...writeDemos}
</script>




<style type="text/scss">
  @import '../styles/core';


  .demo-list {
    list-style-type: none;
  }

</style>




