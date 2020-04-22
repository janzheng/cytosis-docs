<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<p class="">{@html marked(more) }</p>


  <div class="Formlet Formlet-input _form-control" >
    <label class="_form-label" >Type a message and tags!</label>
    <div class="_action _flex-row-sm _padding-top-half">
      <input class="_form-input __width-full _margin-right" type="text" bind:value={message} placeholder="Type a message"
          on:keydown={ (evt) => {if(evt.keyCode == 13) sendMessage() } } />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={tags} placeholder="Type a tag like 'tag one, tag two'"
        on:keydown={ (evt) => {if(evt.keyCode == 13) sendMessage() } } />
      <input class="submit-button _button _flex-1 __outline __short _margin-bottom-none " type="submit" on:click={sendMessage}>
    </div>
  </div>

  <CytosisWip
    options={{
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      configName: 'messages-all',
      routeDetails: 'Demo Eleven',
    }}
    bind:loadCytosis={loadCytosis}
    bind:isLoading={cytosisLoading}
    bind:cytosis={cytosisObject}
  >
    {#if cytosisLoading}
      ... loading Cytosis object ...
    {/if}
    {#if cytosisObject}
      <div class="_card _padding --flat">
        {#each cytosisObject.results['Messages'] as message (message.id)}
          <div class="message">{@html marked(message.fields['Message'])}| tags: { message.fields['Tags'] ? message.fields['Tags'].join(', ') : '(no tags)' }</div> 
        {/each}
      </div>
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
  export let more = `⚠️ Be careful! If you expose an Editor user's API key to your table to the browser, anyone can add, edit, or delete the contents on your table. You need to either use a server (or serverless/microservice), or create a second table that protects the content from the main table. Then, you can create a second user, and share your table with that user with Read Only or Editor permissions, and you can use that user's API key to access the table.

To add new items like linked tables and single and multiple select values, you can use "typecast" which creates new items in Airtable. For this to work, make sure the API key's user has **Creator Access** and not merely editor access.
`
  /*
    - matchKeywordWithField
      - show a few field settings
      - show partial — a piece of text appears in a field
      - show regular — for example retrieving a slug or page name


  */

  let status, message = "", tags = ""
  let cytosisObject, loadedConfig, loadCytosis
  let cytosisLoading = false

  let bases = [{
    tables: ["Site Content"],
    options: {
      "view": "content-2--view",
      "maxRecords": 1
    }
  }]

  const sendMessage = async() => {
    await Cytosis.save({
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      tableName: 'Messages',
      tableOptions: {
        insertOptions: ['typecast'],
      },
      payload: {
        Message: message,
        Tags: tags.length > 0 ? tags.split(',').map(item => item.trim()) : null,
      }
    })
    message = ""

    await loadCytosis()
  }

</script>



<style type="text/scss">
  @import '../styles/core';

  .submit-button {
    line-height: 0;
  }

  .message {
    :global(p) {
      display: inline !important;
    }
  }

</style>





