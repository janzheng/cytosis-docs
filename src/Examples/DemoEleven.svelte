<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<p>{@html marked(more) }</p>


  <CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'content-1',
      routeDetails: 'Demo Nine',
    }}

    bind:isLoading={cytosisLoading}
    bind:cytosis={cytosisObject}
  >
    {#if cytosisLoading}
      ... loading Cytosis object ...
    {/if}
    {#if cytosisObject}
      <div class="_card _padding --flat">{@html marked(cytosisObject.results['Site Content'][0].fields['Content'])}</div>
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

  export let title = `9. Saving to Cytosis`
  export let description = `This demo shows how to use a form to save directly to Cytosis.`
  export let more = `⚠️ Be careful! If you expose an Editor user's API key to your table to the browser, anyone can add, edit, or delete the contents on your table. You need to either use a server (or serverless/microservice), or create a second table that protects the content from the main table. Then, you can create a second user, and share your table with that user with Read Only or Editor permissions, and you can use that user's API key to access the table.`
  /*
    - matchKeywordWithField
      - show a few field settings
      - show partial — a piece of text appears in a field
      - show regular — for example retrieving a slug or page name


  */

  let status 
  let cytosisObject, loadedConfig
  let cytosisLoading = false

  let bases = [{
    tables: ["Site Content"],
    options: {
      "view": "content-2--view",
      "maxRecords": 1
    }
  }]

</script>



<style type="text/scss">
  @import '../styles/core';

</style>





