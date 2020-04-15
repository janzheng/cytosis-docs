
<div class="Basic-section section">

	<h2 class="Basic-title title">Basic Usage</h2>

	<div class="Basic-desc desc _margin-bottom-2">{@html marked(`
### Cytosis setup

- Create a new table, or duplicate the [Cytosis documentation table](https://airtable.com/shr2ITCNwUa0UCmPH)
- Create another user to Airtable and invite that user to your table with read-only access. You can use an alternate or temporary e-mail address. Open that temporary user's account settings, and create an API key for that user. That API key will protect your Airtable from being vandalized
	- For experimentation purposes, you can use my public user account: public@janzheng.com, apiKey: keygfuzbhXK1VShlR
- Get the Base ID by clicking Help > API Documentation in the Airtable base, then copying the part that starts with "app" \`https://airtable.com/appc0M3MdTYATe7RO/api/docs#curl/introduction\` - (e.g. \`appc0M3MdTYATe7RO\` in this example)
	`)}


	</div>

	<DemoOne />
	<!-- <DemoTwo /> -->


</div>



<script>
  import DemoOne from '../examples/DemoOne.svelte'
  import DemoTwo from '../examples/DemoTwo.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

</script>




<style type="text/scss">
  @import '../styles/core';

</style>


