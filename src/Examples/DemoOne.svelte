

	<div class="">
		<h4>Barebones Demo</h4>

		<p>This demo retrieves a table from the given Base, by reading a record in '_cytosis'
		</p>

		<CytosisWip
		  apiKey={'keygfuzbhXK1VShlR'} 
		  baseId={'appc0M3MdTYATe7RO'} 
		  tableQuery={'basic-demo-1'}
		  routeName={'basic-demo-1'}
		  bind:isLoading={cytosisLoading}
		  bind:cytosis={cytosisObject}
		>
			{#if cytosisLoading}
				... loading Cytosis object ...
			{/if}
			{#if cytosisObject}
		  	<div class="_card _padding --flat">{@html marked(cytosisObject.tables['Site Content'][0].fields['Markdown'])}</div>
			{/if}
		</CytosisWip>
	  
	</div>




<script>
  import CytosisWip from '../Components/CytosisWip.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  let cytosisObject
  let cytosisLoading = false
  $: console.log(cytosisObject)

</script>



<style type="text/scss">
  @import '../styles/core';

</style>





