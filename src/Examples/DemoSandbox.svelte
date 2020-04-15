

	<div class="">
		<h4>Demo Sandbox</h4>

		<p>Play around!
		</p>

		<CytosisPaginate
		  apiKey={'keygfuzbhXK1VShlR'} 
		  baseId={'appc0M3MdTYATe7RO'} 
		  configName={'items-paged'}
		  routeDetails={'Testing paged items'}
		  bind:isLoading={cytosisLoading}
		  bind:cytosis={cytosisObject}
		  bind:data={data}
		>

			{#if cytosisLoading}
				... loading Cytosis object ...
			{/if}

			{#if data}

				<div>total: {data.results.length}</div>

				{#if data}
					<button class="__outline __short __width_max _margin-top" on:click={ () => {
						data.getNextPage().then(({results, isDone}) => {
							data.results = results
							if(isDone)
								data.isDone = isDone
						})
					}}>
					{#if !data.isDone}
						Get Next Page
					{:else}
						That's all folks!
					{/if}

				</button>
				{/if}

				{#each data.results as item (item.id)}
					<div>{ item.fields['Name'] } </div>
				{/each}
			{/if}

		</CytosisPaginate>
	  
	</div>




<script>
  import CytosisPaginate from '../components/CytosisPaginate.svelte'
	// import marked from 'marked'

 //  marked.setOptions({
 //    gfm: true,
 //    breaks: true,
 //  })

  let cytosisObject
  let data, items, isDone

  let cytosisLoading = true
  $: if(data) {
  	// items = data.results
  	// isDone = data.isDone
  	// getNextPage = data.getNextPage
  	console.log('Sandbox Results:', data)
  	// cytosisObject.getNextPage()
  	// items = cytosisObject['results']['Items Table']
  }


</script>



<style type="text/scss">
  @import '../styles/core';

</style>





