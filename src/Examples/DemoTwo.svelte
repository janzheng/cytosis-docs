

	<div class="">
		<h2>{ title }</h2>
		<div>{@html marked(description) }</div>

		<CytosisWip
		  apiKey={'keygfuzbhXK1VShlR'} 
		  baseId={'appc0M3MdTYATe7RO'} 
		  configName={'items-all'}
		  routeDetails={'Testing large collection item retrieval'}
		  bind:isLoading={cytosisLoading}
		  bind:cytosis={cytosisObject}
		>

			{#if cytosisLoading}
				... loading Cytosis object ...
			{/if}

			{#if cytosisObject}

				{#each items as item (item.id)}
					<div>{ item.fields['Name'] } </div>
				{/each}

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

  export let title = `2. Get Items Demo`
  export let description = `This demo retrieves a ton of items from the Items Table in a non-paginated manner`


  let cytosisObject
  let items

  let cytosisLoading = false
  $: if(cytosisObject) {
  	console.log('Demo Two:', cytosisObject)
  	// cytosisObject.getNextPage()
  	items = cytosisObject['results']['Items Table']
  }


</script>



<style type="text/scss">
  @import '../styles/core';

</style>





