<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>
	<div>{@html marked(more) }</div>

	<CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'content-1',
      routeDetails: 'Demo Four',
    }}

	  apiKey={'keygfuzbhXK1VShlR'} 
	  baseId={'appc0M3MdTYATe7RO'} 
	  configName={'content-1'}
	  routeDetails={'Cytosis Four'}
	  bind:isLoading={cytosisLoading}
	  bind:cytosis={cytosisObject}
	>
		{#if cytosisLoading}
			... loading Cytosis object ...
		{/if}

		{#if cytosisObject}
			<div class="_grid-2-xs _margin-bottom">
				<button class="_button __short __outline _margin-none"
					on:click={() => {
						console.log('re-initializing config', cytosisObject, newConfigObject)
						const config = newConfigObject || cytosisObject.configObject
						Cytosis.initFromConfig(cytosisObject, config)
					}}>Re-initialize Config</button>
				<button class="_button __short __outline _margin-none"
					on:click={() => {
						console.log('reloading data')
						Cytosis.loadCytosisData(cytosisObject).then((cytosis) => {
							cytosisObject = cytosis // force reactivity
						})
					}}>Reload Data</button>
			</div>

	  	<div class="_card _padding __flat">{@html marked(cytosisObject.results['Site Content'][0].fields['Content'])}</div>

			<div class="_margin-bottom">
				<textarea class="configTextarea" name="config" rows="30" value={configJson} 
					on:change={() => {
						newConfigObject = JSON.parse(this.value)
					}} />
			</div>

		{/if}
	</CytosisWip>
  
</div>




<script>
  import CytosisWip from '../components/CytosisWip.svelte'
	import Cytosis from '../cytosis_wip/cytosis'

	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  export let title = `4. Config & data reload/refresh`
  export let description = `This demo shows how to retrieve a table from a custom or given config object`
  export let more = `
This demo by default gets a config from 'content-1' from the '_cytosis' table — you can change the view from 'content-1--view' to 'content-2--view' see different content get pulled in. Make sure to reload config and data!

	`

  let cytosisObject
  let cytosisLoading = false
  let configObject, configJson, newConfigObject

  $: if(cytosisObject) {
  	configObject = cytosisObject.configObject
  	configJson = JSON.stringify(configObject, undefined, 4)
  }

</script>



<style type="text/scss">
  @import '../styles/core';


  // .configTextarea {
  // 	padding: $unit;
  // 	width: 100% !important;
  // }

</style>





