<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>



  <h3>Views</h3>
  <p>{@html marked(views) }</p>
  <CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'content-preview',
      routeDetails: 'Demo Seven, Example 1',
    }}

    apiKey={'keygfuzbhXK1VShlR'} 
    baseId={'appc0M3MdTYATe7RO'} 
    configName={'content-preview'}
    routeDetails={'Demo Seven, Example 1'}
    bind:isLoading={cytosisLoading_One}
    bind:cytosis={cytosisObject_One}
  >
    {#if cytosisLoading_One}
      ... loading Cytosis object ...
    {/if}
    {#if cytosisObject_One}
      <div class="_card _padding --flat">{@html marked(cytosisObject_One.results['Site Content'][0].fields['Content'])}</div>
    {/if}
  </CytosisWip>






  <h3 class="_margin-top-2">Filtering</h3>
  <p>{@html marked(filters) }</p>
  <CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'content-all',
      routeDetails: 'Demo Seven, Example 2',
      tableOptions: {
        filterByFormula: "{Status} = \"Preview\""
      }
    }}
    apiKey={'keygfuzbhXK1VShlR'} 
    baseId={'appc0M3MdTYATe7RO'} 
    configName={'content-all'}
    routeDetails={'Demo Seven, Example 2'}
    tableOptions={{
      filterByFormula: "{Status} = \"Preview\""
    }}
    bind:isLoading={cytosisLoading_Two}
    bind:cytosis={cytosisObject_Two}
  >
    {#if cytosisLoading_Two}
      ... loading Cytosis object ...
    {/if}
    {#if cytosisObject_Two}
      <div class="_card _padding --flat">{@html marked(cytosisObject_Two.results['Site Content'][0].fields['Content'])}</div>
    {/if}
  </CytosisWip>

  <p class="_margin-top-2">This next example shows how dynamic filtering might work, where we filter the field Tags against a phrase like {filterChoice}. In this example we use a FIND() filter, which means the more specific the phrase is, the more accurate the results will be. Unfortunately, Airtable doesn't have a lot of advanced filter capabilities, so it's usually be better to do the final filtering step after pulling in the data.</p>

  <div class="_grid-1-3 _grid-gap">
    <div clas="_form-radiogroup">
      <p>Sort Choice: {filterChoice}</p>

      <div class="_form-radio __inline">
        <label>
          <input type=radio bind:group={filterChoice} value={"Filter One"}>
          Filter One
        </label>
      </div>

      <div class="_form-radio __inline">
        <label>
          <input type=radio bind:group={filterChoice} value={"Filter Two"}>
          Filter Two
        </label>
      </div>

      <div class="_form-radio __inline">
        <label>
          <input type=radio bind:group={filterChoice} value={"Filter Three"}>
          Filter Three
        </label>
      </div>
    </div>

    <CytosisWip
      options={{
        apiKey: 'keygfuzbhXK1VShlR',
        baseId: 'appc0M3MdTYATe7RO',
        configName: 'content-all',
        routeDetails: 'Demo Seven, Example 3',
        tableOptions: {
                  filterByFormula: `FIND("${filterChoice}",Tags)`
                }
      }}
      bind:isLoading={cytosisLoading_Three}
      bind:cytosis={cytosisObject_Three}
    >
      {#if cytosisLoading_Three}
        ... loading Cytosis object ...
      {/if}
      {#if cytosisObject_Three}
        <div class="_card _padding --flat">{@html marked(cytosisObject_Three.results['Site Content'][0].fields['Content'])}</div>
      {/if}
    </CytosisWip>
  </div>







  <h3 class="_margin-top-2">Sorting</h3>
  <p>{@html marked(sorting) }</p>

  <div class="_grid-1-3 _grid-gap">
    <div clas="_form-radiogroup">
      <p>Sort Choice: {sortChoice} / {JSON.stringify(sortArray)} </p>

      <div class="_form-radio __inline">
        <label>
          <input type=radio bind:group={sortChoice} value={"Sort by Name"}
            on:click={ () => {sortArray = [{field: "Name", direction: "asc"}] }}
          >
          Sort by Name
        </label>
      </div>

      <div class="_form-radio __inline">
        <label>
          <input type=radio bind:group={sortChoice} value={"Sort by Content"}
            on:click={ () => { sortArray = [{field: "Content", direction: "asc"}] }}
          >
          Sort by Content
        </label>
      </div>
    </div>

    <CytosisWip
      options={{
        apiKey: 'keygfuzbhXK1VShlR',
        baseId: 'appc0M3MdTYATe7RO',
        configName: 'sort-content',
        routeDetails: 'Demo Seven, Example 4',
        tableOptions: {
          sort: sortArray,
        }
      }}
      bind:isLoading={cytosisLoading_Four}
      bind:cytosis={cytosisObject_Four}
    >
      {#if cytosisLoading_Four}
        ... loading Cytosis object ...
      {/if}
      {#if cytosisObject_Four}
        <div class="_card _padding --flat">
          {#each cytosisObject_Four.results['Site Content'] as item (item.id+sortChoice)}
            <p>
              Name: {item.fields['Name']} — 
              Content: {@html item.fields['Content']}
            </p>
          {/each}
        </div>
      {/if}
    </CytosisWip>
  </div>








  <h3 class="_margin-top-2">Fields</h3>

  <p>{@html marked(fields) }</p>

  <div class="_grid-1-3 _grid-gap">
    <div clas="_form-radiogroup">

      <div class="_form-checkbox __inline">
        <label>
          <input type=checkbox bind:checked={showContentField}
          >
          Show Content field
        </label>
      </div>

      <div class="_form-checkbox __inline">
        <label>
          <input type=checkbox bind:checked={showTagsField}>
          Show Tags field
        </label>
      </div>
    </div>

    <CytosisWip
      options={{
        apiKey: 'keygfuzbhXK1VShlR',
        baseId: 'appc0M3MdTYATe7RO',
        configName: 'filter-all',
        routeDetails: 'Demo Seven, Example 5',
        tableOptions: {
          fields: [
            ...(showTagsField ? ['Tags'] : []),
            ...(showContentField ? ['Content'] : []),
          ],
        }
      }}
      bind:isLoading={cytosisLoading_Five}
      bind:cytosis={cytosisObject_Five}
    >
      {#if cytosisLoading_Five}
        ... loading Cytosis object ...
      {/if}
      {#if cytosisObject_Five}
        <div class="_card _padding --flat">
          {#each cytosisObject_Five.results['Site Content'] as item (item.id)}
            <p>
              Content: {@html item.fields['Content']} |
              Tags: {@html item.fields['Tags']}
            </p>
          {/each}
        </div>
      {/if}
    </CytosisWip>
  </div>




  
</div>







<script>
	import Cytosis from '../cytosis_wip/cytosis'
  import CytosisWip from '../components/CytosisWip.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  export let title = `7. Views, filtering, sorting, and fields`
  export let description = `This demo shows how to take advantage of the Airtable API and Cytosis' views, filtering, sorting, and fields mechanisms.`

  export let views = `In Airtable, each Table can have one or more views, that let you look at the data in different ways. For example, you might have a view with a filter that only lets you look at items with a Status (a single select) option of "Published". The view might also be able to sort and filter the data accordingly.

Because views are created and managed directly in Airtable, they're an easy way to control how data shows up on your site.

In this example, we look at a view that only shows "preview" content by creating a view in Airtable called "Preview", adding a filter that only show rows with "Status" marked as "Preview", and adding a config row in the _cytosis table called "content-published" that's set to use the view "Preview".

  Be aware that setting content to "Published" doesn't completely hide it from Cytosis, it just allows you to control what the site sees. Users could still dig into the code and find content with a "Published" tag — the view is just there to control what shows up on your site, not for security reasons. If you need it to be secure, you can use a serverless/microservice with Cytosis installed, as a proxy,   

  `

  export let filters = `Most of the time you only really need to access filters and sorting through views — that's the easiest way to set up your data. Code-based views and filters can useful if you need your filters to be programmatic, or because your use case requires too many different views to be manageable in Airtable, or if you need dynamic views.

  In this example, we query all items in the 'Site Content' table with the 'site-content-all' query, but we then apply an Airtable [Filter Formula](https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference) to only get the Preview item.

  For example, to only include records where Name isn't empty, pass in \`NOT({Name} = '')\`. Formulas can get tricky to test and write here, but in Airtable, just create a new formula field (column), and you can test your formulas that way before copying them into code. For this example, we use the formula: \`{Status} = "Preview"\`
  `

  export let sorting = `Sorting takes a sorting object, which wraps a sort array (check the base-specific API docs by going to Help > API Documentation in Airtable). In this example we can either sort by the Name field or by the Content field.
  `

  export let fields = `In Airtable, a "field" is a column. The Fields field lets you specify the fields that Airtable returns, which could help reduce data load, if you have a large table. Airtable fields takes an array of field names like 'fields: ["Name", "Content"]'. If both fields are removed from the array, Airtable will return all fields.
  `

  let status, filterChoice = "Filter One"
  let sortChoice = "Sort by Name", sortArray = [{field: "Name", direction: "asc"}]
  let showTagsField = true, showContentField = true, fieldsArray = []


  let cytosisObject_One, cytosisLoading_One = false
  let cytosisObject_Two, cytosisLoading_Two = false
  let cytosisObject_Three, cytosisLoading_Three = false
  let cytosisObject_Four, cytosisLoading_Four = false
  let cytosisObject_Five, cytosisLoading_Five = false


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





