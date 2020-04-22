<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<!-- <p>{@html marked(more) }</p> -->


  <CytosisWip
    options={{
      bases:  bases,
      routeDetails: 'Demo Ten',
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
          <p>{@html item.fields['Content'] ? marked(item.fields['Content']) : item.fields['Message']}</p>
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

  export let title = `10. Multiple Airtables`
  export let description = `This demo shows to combine multiple bases into one Cytosis.`

  export let more = `This example is similar to [Demo Five](/demos/demoFive) in that it doesn't use a config (though you could do that too), and sends in each base in a 'bases' array, each with its own base and API keys. The second base is the "Editor Public" base we'll use in the Write-capable examples. Keep in mind that you might run into API limits pretty soon if you do this in production, so this is either best for prototype development, or for a server to cache it somewhere`
  /*
    - matchKeywordWithField
      - show a few field settings
      - show partial — a piece of text appears in a field
      - show regular — for example retrieving a slug or page name


  */

  let status 
  let cytosisObject, loadedConfig
  let cytosisLoading = false

  let bases = [
    {
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      tables: ["Site Content"],
      options: {
        "view": "Published",
      }
    },
    {
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'app9xsC0ykwoAYHoC',
      tables: ["Messages"],
      options: {
        "view": "Grid view",
      }
    }
  ]

</script>



<style type="text/scss">
  @import '../styles/core';

</style>





