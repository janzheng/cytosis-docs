

<main class="Demos">

  <div class="_font-bold">Demos</div>
  <nav class=" _margin-bottom-2">
    {#each Object.keys(demos) as demo}
      <div><a class={ isActive(demo) } href="/demos/{demo}">{ demos[demo].name }</a></div>
    {/each}
  </nav>

  {#if demos[demoName]}
	  <svelte:component this={ demos[demoName].component } />
  {/if}

  <FooterSection />
</main>




<script>
  import { cytosis, makers, dropoff, content } from '../stores.js';

  import DemoOne from '../examples/DemoOne.svelte'
  import DemoTwo from '../examples/DemoTwo.svelte'
  import DemoThree from '../examples/DemoThree.svelte'
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
  	'demoOne': {name: "Demo One", component: DemoOne},
    'demoTwo': {name: "Demo Two", component: DemoTwo},
    'demoThree': {name: "Demo Three", component: DemoThree},
  	'sandbox': {name: "Sandbox", component: DemoSandbox},
  }

</script>




<style type="text/scss">
  @import '../styles/core';


</style>




