<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<p>{@html marked(more) }</p>


	<CytosisWip
	  apiKey={'keygfuzbhXK1VShlR'} 
	  baseId={'appc0M3MdTYATe7RO'} 
	  configName={'content-1'}
	  routeDetails={'Cytosis docs basic demo one'}
	  bind:isLoading={cytosisLoading}
	  bind:cytosis={cytosisObject}
	>
		{#if cytosisLoading}
			... loading Cytosis object ...
		{/if}
		{#if cytosisObject}
	  	<div class="_card _padding --flat">{@html marked(cytosisObject.results['Site Content'][0].fields['Markdown'])}</div>

	  	<div class="_card _padding --flat">
	  		{#if status}
	  			<p>{status}</p>
	  		{/if}
	  		<p>Loaded config Object:</p>
	  			{ loadedConfig }
	  	</div>
		{/if}
	</CytosisWip>
  
</div>







<script>
	import Cytosis from '../cytosis_wip/cytosis'
  import CytosisWip from '../components/CytosisWip.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  export let title = `6. Caching strategies`
  export let description = `This demo shows how localStorage, browser-based cache helpers work.`
  export let more = `Th cached config is pulld in automatically if Cytosis finds a cache. By dfault, the cache.`


  let status 
  let cytosisObject, loadedConfig
  let cytosisLoading = false

  let storeCache = function() {
  	if(cytosisObject) {
  		Cytosis.saveConfigCache(cytosisObject)
  		console.log('cache saved!!')
  	}
  }

  let loadCache = function() {
  	if(cytosisObject) {
  		console.log('loading cache!!')
  		loadedConfig = Cytosis.loadConfigCache(cytosisObject)
  		console.log('loaded config: ', loadedConfig)
  	}
  }

  $: if (cytosisObject) {
  	console.log('cytosis loading, storing cache ... ')
  	storeCache()
  	loadCache()
  }


</script>



<style type="text/scss">
  @import '../styles/core';

</style>





