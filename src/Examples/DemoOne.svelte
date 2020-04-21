<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>


	<h3 class="Basic-title title">Basic Usage</h3>

	<div class="Basic-desc desc _margin-bottom-2">{@html marked(`
### Cytosis setup

- Create a new table, or duplicate the [Cytosis documentation table](https://airtable.com/shr2ITCNwUa0UCmPH)
- Create another user to Airtable and invite that user to your table with read-only access. You can use an alternate or temporary e-mail address. Open that temporary user's account settings, and create an API key for that user. That API key will protect your Airtable from being vandalized
	- For experimentation purposes, you can use my public user account: public@janzheng.com, apiKey: keygfuzbhXK1VShlR
- Get the Base ID by clicking Help > API Documentation in the Airtable base, then copying the part that starts with "app" \`https://airtable.com/appc0M3MdTYATe7RO/api/docs#curl/introduction\` - (e.g. \`appc0M3MdTYATe7RO\` in this example)
	`)}
	</div>

	<CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'content-1',
      routeDetails: 'Demo One',
    }}

	  apiKey={'keygfuzbhXK1VShlR'} 
	  baseId={'appc0M3MdTYATe7RO'} 
	  configName={'content-1'}
	  routeDetails={'Cytosis One'}
	  
	  bind:isLoading={cytosisLoading}
	  bind:cytosis={cytosisObject}
	>
		{#if cytosisLoading}
			... loading Cytosis object ...
		{/if}
		{#if cytosisObject}
	  	<div class="_card _padding --flat">{@html marked(cytosisObject.results['Site Content'][0].fields['Markdown'])}</div>
		{/if}
	</CytosisWip>
  
</div>




<script>
  import CytosisWip from '../components/CytosisWip.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  export let title = `1. Barebones Demo`
  export let description = `This demo retrieves a table from the given Base, by reading a record in '_cytosis'`

  let cytosisObject
  let cytosisLoading = false
  $: console.log(cytosisObject)

</script>



<style type="text/scss">
  @import '../styles/core';

</style>





