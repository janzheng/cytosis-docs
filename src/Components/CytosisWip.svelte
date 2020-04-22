

<!-- 

	this is a computed slot to pull data from Airtable!
	this gives the parent component data from Airtable ONLY
	don't put UI in here, pass it through a slot instead

	this uses th work in progress cytosis

 -->

<div class="Cytosis" id="cytosis-{options.configName}">
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
	export let options = {}
	// export let apiKey, apiEditorKey, baseId, configName, routeDetails, bases, useConfigCache, tableOptions
	export let tableName = undefined // convenience — gets the table you want 

	// bind to these value
	export let cytosis // the entire cytosis object
	export let table // sets the table indicated in 'tableName'; convenient



	// good for SSR, but bad for re-running code as you can't re-mount something
  // onMount(async () => {
  export let loadCytosis = async function() {

  	console.log('CytosisWIP loading...', options)
  	// let hey = await getRecord({})
  	// console.log('???', getRecord)

	  try {
	  	isLoading = true

	    const _cytosis = await new Cytosis(options);

	    // const _cytosis = await new Cytosis({
	    //   apiKey, 
	    //   apiEditorKey,
	    //   bases,
	    //   baseId,
	    //   configName,
	    //   routeDetails,
	    //   useConfigCache, 
	    //   tableOptions,
	    // });

	    // console.log('cydata/cytosis', _cytosis)
	    cytosis = await _cytosis

	    // for conveniently grabbing the table you want
	    if(tableName && table)
	    	table = _cytosis.results[tableName]

	  	isLoading = false
	  } catch(err) {
	  	isLoading = false
			isError = true
	    console.error('[Cytosis Data Error]:', err)
	    return Promise.reject()
	  }
  	// })
	}


	$: if(options) { // update when options change
		loadCytosis()
	}

	loadCytosis()

</script>



