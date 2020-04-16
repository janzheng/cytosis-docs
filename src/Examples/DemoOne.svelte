<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<CytosisWip
	  apiKey={'keygfuzbhXK1VShlR'} 
	  baseId={'appc0M3MdTYATe7RO'} 
	  configName={'basic-demo-1'}
	  routeDetails={'Cytosis docs basic demo one'}
	  bind:isLoading={cytosisLoading}
	  bind:cytosis={cytosisObject}
	>
		{#if cytosisLoading}
			... loading Cytosis object ...
		{/if}
		{#if cytosisObject}
	  	<div class="_card _padding --flat">{@html marked(cytosisObject.results['Site Content'][0].fields['Markdown'])}</div>
		{/if}
	</CytosisWip>
  
</div>




<script>
  import CytosisWip from '../components/CytosisWip.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  export let title = `1. Barebones Demo`
  export let description = `This demo retrieves a table from the given Base, by reading a record in '_cytosis'`

  let cytosisObject
  let cytosisLoading = false
  $: console.log(cytosisObject)

</script>



<style type="text/scss">
  @import '../styles/core';

</style>





