

<!-- 

	this is a computed slot to pull data from Airtable!
	this gives the parent component data from Airtable ONLY
	don't put UI in here, pass it through a slot instead

 -->



<div class="Cytosis" id="cytosis-{tableQuery}">
	<slot></slot>
</div>


<!-- this passes data back to the parent -->
<script>
  import { onMount } from 'svelte'
	import Cytosis from 'cytosis'

	export let airKey, airBase, tableQuery, routeName
	export let cytosis // the db object
	export let tableName // convenience — gets the table you want 
	export let table // convenience — gets the table you want quickly

  onMount(async () => {
	  try {
	    const _cytosis = await new Cytosis({
	      airKey, 
	      airBase,
	      tableQuery,
	      routeName,
	    });
	    // console.log('cydata/cytosis', _cytosis)
	    cytosis = await _cytosis
	    console.log('cydata/cytosis', cytosis)

	    if(tableName && table)
	    	table = cytosis.tables[tableName]
	  } catch(err) {
	    console.error('[Cytosis Data Error]:', err)
	    return Promise.reject()
	  }
  })

</script>



