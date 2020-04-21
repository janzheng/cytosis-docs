<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<p>{@html marked(more) }</p>


	<CytosisWip
	  apiKey={'keygfuzbhXK1VShlR'} 
	  baseId={'appc0M3MdTYATe7RO'} 
	  configName={'content-1'}
	  routeDetails={'Cytosis Nine'}
	  bind:isLoading={cytosisLoading}
	  bind:cytosis={cytosisObject}
	>
		{#if cytosisLoading}
			... loading Cytosis object ...
		{/if}
		{#if cytosisObject}
	  	<div class="_card _padding --flat">{@html marked(cytosisObject.results['Site Content'][0].fields['Content'])}</div>

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

  export let title = `9. Linked Queries`
  export let description = `This demo shows how combine queries into a single query in config. This is really useful for splitting and creating complex, fine-grained queries.`
  export let more = `* Be careful! If you expose an Editor user's API key to your table to the browser, anyone can add, edit, or delete the contents on your table. You need to either use a server (or serverless/microservice), or create a second table that protects the content from the main table`

  /*
    - matchKeywordWithField
      - show a few field settings
      - show partial — a piece of text appears in a field
      - show regular — for example retrieving a slug or page name


  */

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





