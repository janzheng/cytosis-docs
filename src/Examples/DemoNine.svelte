<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<p>{@html marked(more) }</p>


  <CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'linked-query-example',
      routeDetails: 'Demo Nine',
    }}

    bind:isLoading={cytosisLoading}
    bind:cytosis={cytosisObject}
  >
    {#if cytosisLoading}
      ... loading Cytosis object ...
    {/if}
    {#if cytosisObject}
      <p>Tables: {Object.keys(cytosisObject.results).join(', ')}</p>
      {#each Object.keys(cytosisObject.results) as table (table)}
        <h4>Table: { table }</h4>
        {#each cytosisObject.results[table] as item (item.id)}
          <p>{@html marked(item.fields['Content'])}</p>
        {/each}
      {/each}

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
  export let more = `This example shows how to combine two different table queries in _cytosis, by specifying a linked query ("linked-query-example" in this case). This example draws data from the Items Table and the Sorted records of the Site Content table. Note that we can't control the order the tables come back in.`

  /*
    - matchKeywordWithField
      - show a few field settings
      - show partial — a piece of text appears in a field
      - show regular — for example retrieving a slug or page name


  */

  let status 
  let cytosisObject, loadedConfig
  let cytosisLoading = false


</script>



<style type="text/scss">
  @import '../styles/core';

</style>





