<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>
	<div>{@html marked(more) }</div>


	<div class="_grid-2-1-xs _margin-bottom">

		<textarea class="configTextarea" name="config" rows="11" 
			value={JSON.stringify(bases, undefined, 4)}
			on:change={() => {
				loadCytosis = false
				bases = JSON.parse(this.value)
			}}
		/>
 
		<div class="">
			<button class="_button __short __outline __width-full _margin-none"
				on:click={() => {
					loadCytosis = true
				}}>Load Cytosis
			</button>
		</div>
		
	</div>

	{#if loadCytosis}
		<CytosisWip
	    options={{
	      apiKey: 'keygfuzbhXK1VShlR',
	      baseId: 'appc0M3MdTYATe7RO',
	      bases: 	bases,
	      routeDetails: 'Demo Five',
	    }}

		  apiKey={'keygfuzbhXK1VShlR'} 
		  baseId={'appc0M3MdTYATe7RO'}
		  bases={bases}
	  	routeDetails={'Cytosis Five'}
	  	
		  bind:isLoading={cytosisLoading}
		  bind:cytosis={cytosisObject}
		>
			{#if cytosisLoading}
				... loading Cytosis object ...
			{/if}

			{#if cytosisObject}
			
		  	<div class="_card _padding __flat">{@html marked(cytosisObject.results['Site Content'][0].fields['Markdown'])}</div>			
			{/if}
		</CytosisWip>
  {/if}
  
</div>




<script>
  import CytosisWip from '../components/CytosisWip.svelte'
	import Cytosis from '../cytosis_wip/cytosis'

	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })


  let loadCytosis = false // gate Cytosis from loading

  export let title = `5. Bypassing config and directly setting your bases `
  export let description = `This demo shows how to completely bypass config, to speed up loading`
  export let more = `
This demo shows how to pull data from Cytosis without using a config table like '_cytosis', by passing in an array of 'bases'. Here's an example of what a base config object looks like. (As a note, base config objects are built from the '_cytosis' config table)

	`

  let bases = [{
	  tables: ["Site Content"],
	  options: {
	    "view": "content-2--view",
	    "maxRecords": 1
	  }
  }]

  let cytosisObject
  let cytosisLoading = false

  $: if(cytosisObject) {
  	console.log('cytosisObject', cytosisObject)
  }

</script>



<style type="text/scss">
  @import '../styles/core';


  // .configTextarea {
  // 	padding: $unit;
  // 	width: 100% !important;
  // }

</style>





