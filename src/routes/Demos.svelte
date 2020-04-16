<svelte:options accessors/>

<main class="Demos">

  <h5 class="_font-bold">Demo Menu</h5>
  <nav class=" _margin-bottom-2">
    {#each Object.keys(demos) as demo}
      <div><a class={ isActive(demo) } href="/demos/{demo}">{ demos[demo].title }</a> — { demos[demo].description }</div>
    {/each}
  </nav>

  {#if demos[demoName]}
	  <svelte:component this={ demos[demoName].component } title={demos[demoName].title} description={demos[demoName].description} />
  {/if}

  <FooterSection />
</main>




<script>
  import { cytosis, makers, dropoff, content } from '../stores.js';

  import DemoOne from '../examples/DemoOne.svelte'
  import DemoTwo from '../examples/DemoTwo.svelte'
  import DemoThree from '../examples/DemoThree.svelte'
  import DemoFour from '../examples/DemoFour.svelte'
  import DemoSandbox from '../examples/DemoSandbox.svelte'

  import FooterSection from '../sections/FooterSection.svelte'
  export let params, demoObject

  $: demoName = params['demoName']
  $: isActive = str => params['demoName'] === str ? 'selected' : '';

  $: if(!demos[demoName]) {
    // no demo route
    console.log('[Demos] No demo found at ', demoName)
    window.location = '/404'
  }

  let demos = {
  	'demoOne': {name: "Demo One", component: DemoOne, title: "1. Basics", description: "This demo retrieves a table from the given Base, by reading a record in '_cytosis'"},
    'demoTwo': {name: "Demo Two", component: DemoTwo, title: "2. Get a table of items", description: "This demo retrieves a ton of items from the Items Table in a non-paginated manner"},
    'demoThree': {name: "Demo Three", component: DemoThree, title: "3. Get a table of items in a paginated way", description: "This demo shows how to use 'getPageTable'"},
    'demoFour': {name: "Demo Four", component: DemoFour, title: "4. Custom configs and tables Demo", description: "This is how to use custom configs and tables without needing a '_cytosis' table"},
  	'sandbox': {name: "Sandbox", component: DemoSandbox, title: "Sandbox", description: "This is a sandbox. Have fun!"},
  }

</script>




<style type="text/scss">
  @import '../styles/core';


</style>




