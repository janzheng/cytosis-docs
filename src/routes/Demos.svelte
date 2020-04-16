<svelte:options accessors/>

<main class="Demos">

  <DemoMenu demoName bind:demos={demos} />

  {#if demos && demos[demoName]}
	  <svelte:component this={ demos[demoName].component } title={demos[demoName].title} description={demos[demoName].description} />
  {/if}

  <FooterSection />
</main>




<script>
  import { cytosis, makers, dropoff, content } from '../stores.js';

  import DemoMenu from '../components/DemoMenu.svelte'
  import FooterSection from '../sections/FooterSection.svelte'

  export let demoName, demos, params

  $: demoName = params['demoName'] // from router

  // $: if(!demos[demoName]) {
  //   // no demo route
  //   console.log('[Demos] No demo found at ', demoName)
  //   window.location = '/404'
  // }

</script>




<style type="text/scss">
  @import '../styles/core';


</style>




