<svelte:options accessors/>

<div class="">
  <h2>{ title }</h2>
  <div>{@html marked(description) }</div>
  <div>{@html marked(more) }</div>



  <div class="Formlet Formlet-input _form-control" >
    <label class="_form-label" >Search: ({searchTerm || 'type something'})</label>
    <input class="_form-input __width-full" type="text" bind:value={searchTerm}>
    <div class="_grid-2 _margin-top">
      <div class="_card _padding">
        <div class="_form-checkbox __inline _padding-top">
          <label>
            <input type=checkbox bind:checked={exactMatch}
            >
            Exact match?
          </label>
        </div>
        <div class="_form-checkbox __inline ">
          <label>
            <input type=checkbox bind:checked={matchCase}
            >
            Match case?
          </label>
        </div>
      </div>
      <div class="_card _padding">
        <div class="_form-checkbox __inline _padding-top">
          <label>
            <input type=checkbox bind:checked={matchName}
            >
            Use [Name] field
          </label>
        </div>
        <div class="_form-checkbox __inline ">
          <label>
            <input type=checkbox bind:checked={matchContent}
            >
            Use [Content] field
          </label>
        </div>
        <div class="_form-checkbox __inline ">
          <label>
            <input type=checkbox bind:checked={matchId}
            >
            Use [Id] field
          </label>
        </div>
      </div>
    </div>
  </div> 

  <CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'content-all',
      routeDetails: 'Demo Eight',
      tableOptions: {
        keyword: searchTerm && !searchArray ? searchTerm : undefined,
        keywords : searchTerm && searchArray,
        // matchKeywordWithField: 'Content',
        matchKeywordWithFields: matchFields,
        matchStyle: exactMatch == true ? 'exact' : 'partial',
        matchCase,
      }
    }}
    bind:isLoading={cytosisLoading}
    bind:cytosis={cytosisObject}
  >
    {#if cytosisLoading}
      ... loading Cytosis object ...
    {/if}
    {#if cytosisObject}
      <div class="_card _padding --flat">
        {#each cytosisObject.results['Site Content'] as item (item.id)}
            <p>{@html marked(item.fields['Content'])}</p>
        {/each}
        {#if cytosisObject.results['Site Content'].length ==0}
          No results — please tweak your search terms
        {/if}
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

  export let title = `8. Search`
  export let description = `This demo shows how to use cytosis to search and retrieve from Airtable.`

  export let more = `In Airtable, each Table can have one or more views, that let you look at the data in different ways. For example, you might have a view with a filter that only lets you look at items with a Status (a single select) option of "Published". The view might also be able to sort and filter the data accordingly.

This example searches the Content field and returns the results. Try typing something like "Sorted" — with exact match, only the one term will show up, otherwise all the terms that contain "Sorted" will show up
  `

  let status, searchTerm = "", searchArray, exactMatch = false, matchCase = false
  let matchName = false, matchContent = true, matchId = true, matchFields = []
  let cytosisObject, cytosisLoading = false

  $: matchFields = [
    matchName ? 'Name' : undefined,
    matchContent ? 'Content' : undefined,
    matchId ? 'Id' : undefined,
  ]

  $: console.log('matchf', matchFields)

  $: if(searchTerm.split(',').length > 1){
    searchArray = searchTerm.split(',')
    console.log('multiple search?', searchTerm, searchArray)
  } else {
    searchArray = null
  }

</script>



<style type="text/scss">
  @import '../styles/core';

  label {
    input {
      position: relative;
      bottom: 3px;
    }
  }

</style>





