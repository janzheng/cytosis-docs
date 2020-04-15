

<!-- 

	this is a computed slot to pull data from Airtable!
	this gives the parent component data from Airtable ONLY
	don't put UI in here, pass it through a slot instead

	this uses th work in progress cytosis

 -->



<div class="Cytosis" id="cytosis-{configName}">
	<slot></slot>

</div>


<!-- this grabs data w/ Cytosis
	pass data back to parent using a binding in the parent
 -->
<script>
  import { onMount } from 'svelte'
	import Cytosis from '../cytosis_wip/cytosis'
	// import { getRecord } from '../cytosis_wip/cytosis'

	export let isLoading = false
	export let isError = false

	// required values
	export let apiKey, baseId, configName, routeDetails

	// bind to these value
	export let cytosis // the entire cytosis object
	export let data // sets the table indicated in 'tableName'; convenient

  onMount(async () => {

	  try {
	  	isLoading = true

	    cytosis = await new Cytosis({
	      apiKey, 
	      baseId,
	      configName,
	      routeDetails,
	      getConfigOnly: true,
	    });

		  // Cytosis.getPageTable({
		  // 	cytosis,
		  // 	routeDetails: 'Pagination demo',
		  // }).then((_results) => {
		  // 	// console.log('getPageTable page one:', _results)
	  	// 	isLoading = false
		  // 	data = _results
		  // 	// items = [... items, ... await results.getNextPage()]
		  // })

		  Cytosis.getPageTable({
		  	cytosis,
		  	routeDetails: 'Pagination demo',
		  }, (_results) => {
		  	isLoading = false
		  	data = _results
		  })

	  } catch(err) {
	  	isLoading = false
			isError = true
	    console.error('[Cytosis Data Error]:', err)
	    return Promise.reject()
	  }
  })


</script>



