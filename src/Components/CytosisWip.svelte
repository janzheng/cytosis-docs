

<!-- 

	this is a computed slot to pull data from Airtable!
	this gives the parent component data from Airtable ONLY
	don't put UI in here, pass it through a slot instead

	this uses th work in progress cytosis

 -->



<div class="Cytosis" id="cytosis-{tableQuery}">
	<slot></slot>
</div>


<!-- this grabs data w/ Cytosis
	pass data back to parent using a binding in the parent
 -->
<script>
  import { onMount } from 'svelte'
	import Cytosis from '../cytosis_wip/cytosis'

	export let isLoading = false
	export let isError = false

	// required values
	export let apiKey, baseId, tableQuery, routeName
	export let tableName // convenience — gets the table you want 

	// bind to these value
	export let cytosis // the entire cytosis object
	export let table // sets the table indicated in 'tableName'; convenient

  onMount(async () => {
	  try {
	  	isLoading = true
	    const _cytosis = await new Cytosis({
	      apiKey, 
	      baseId,
	      tableQuery,
	      routeName,
	    });
	    // console.log('cydata/cytosis', _cytosis)
	    cytosis = await _cytosis
	  	isLoading = false
	    // console.log('cydata/cytosis', cytosis)

	    if(tableName && table)
	    	table = cytosis.tables[tableName]
	  } catch(err) {
	  	isLoading = false
			isError = false
	    console.error('[Cytosis Data Error]:', err)
	    return Promise.reject()
	  }
  })

</script>



