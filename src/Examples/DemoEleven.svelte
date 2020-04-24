<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>



	<h4>.getRecord()</h4>

	<p>{@html marked(`\`getRecord\` uses Airtable's \`.find()\` function to grab a single record straight from Airtable. In Svelte, we use an #await block to display it.
	`)}</p>

	{#await Cytosis.getRecord({
  	recordId: 'rec525Ip5YJCJMS7F',
  	tableName: 'Site Content',
  	apiKey: 'keygfuzbhXK1VShlR',
  	baseId: 'appc0M3MdTYATe7RO',
  })}
		<p>...loading record...</p>
	{:then value}
  	<div class="_card _padding --flat">{@html marked(value.fields['Content'])} — ID: { value.id }</div>
	{:catch error}
  	<div class="_card _padding --flat">Error: { error }</div>
	{/await}


	<h2>Cytosis getters</h2>

	<p>{@html marked(`For the following examples, we've pulled the Site Content table using Cytosis`)}</p>

	<CytosisWip
    options={{
      apiKey: 'keygfuzbhXK1VShlR',
      baseId: 'appc0M3MdTYATe7RO',
      configName: 'all-data',
      routeDetails: 'Demo Eleven',
    }}
	  
	  bind:isLoading={cytosisLoading}
	  bind:cytosis={cytosisObject}
	>
		{#if cytosisLoading}
			... loading Cytosis object ...
		{/if}
		{#if cytosisObject}
	  	<div class="_card _padding --flat">Cytosis Loaded. # of records loaded: { cytosisObject.results['Site Content'].length }</div>
		{/if}
	</CytosisWip>
  

	{#if cytosisObject}

		<h4>.getById()</h4>

		<p>{@html marked(`\`getById\` does is similar to getRecord and finds a record by its Airtable ID from a loaded Cytosis object instead Airtable's API.`)}</p>
		<div class="_card _padding --flat">{ Cytosis.getById('rec525Ip5YJCJMS7F', cytosisObject.results).fields['Content'] } — ID: { Cytosis.getById('rec525Ip5YJCJMS7F', cytosisObject.results).id } </div>
	

		<h4>.getByIds()</h4>
		<p>{@html marked(`\`getByIds(recordIdArray, source, fieldName)'\` — this is similar to getById, but takes an array of record IDs. In this example, we get the linked records of linked-item-0 and linked-item-0>3. By default this returns an object, but if a fieldName is provided, it will just return the content of the given field. `)}</p>
		<div class="_card _padding --flat">
			<p>{ Cytosis.getByIds(['recNzgaz2uU24SV8L', 'recByHLgbfKWTEObU'], cytosisObject.results, 'Name' ).join(', ')}</p>
		</div>

		<h4>.findOne()</h4>
		<p>{@html marked(`\`findOne()\` will find a string that matches a cell or record, given a table and a field name. This one is really useful for grabbing content quickly by the key field (usually 'Name'), rather than by ID. In this case it's 'content-1'`)}</p>
		<div class="_card _padding --flat">{ Cytosis.findOne('content-1', cytosisObject.results['Site Content']).fields['Content'] }</div>



		<h4>.findField()</h4>
		<p>{@html marked(`\`findField()\` is a convenience function for 'findOne'. This returns a specific field instead of the entire object.`)}</p>
		<div class="_card _padding --flat">{ Cytosis.findField('content-1', cytosisObject.results['Site Content'], 'Content')}</div>


		<h3>Finding and Searching</h3>

		<h4>.find()</h4>
		<p>{@html marked(`\`find\` gets a specific record or records based on a special string request, as explained below (for string matching, use ".search()" below). Format the string request depending on what kind of data you need. This is useful for the CDN-version where ES6 functions aren't available`)}</p>

		<h5>Finding a Record by Name</h5>
		<p>{@html marked(`\`find(findStr, tables[], fields=['Name']) | findStr = 'recordName'\` gets the first item from a given array of tables that exactly matches the string to the given fields. In this example we match the 'archived-content' record in 'Site Content'. This returns a record.`)}</p>
		<div class="_card _padding --flat">{ Cytosis.find('content-1', cytosisObject.results ).fields['Content']}</div>
		<p>{@html marked(`But we can also match any fields we want, so in this example we match the content of the 'filter-3' record in 'Site Content'`)}</p>
		<div class="_card _padding --flat">{ Cytosis.find('Content for Filter 3', cytosisObject.results, ['Content']).fields['Content'] }</div>

		<h5>Finding a Record by Table and Row</h5>
		<p>{@html marked(`\`find(findStr, tables[], fields=['Name']) | findStr = 'tableName.recordName'\` — sometimes you want to explicitly specify which table you want a result from. This is useful for join operations, where sometimes the same value exists in two tables. Be aware that this returns an array of objects.`)}</p>
		<div class="_card _padding --flat">
			<p>{ Cytosis.find('Site Content.content-1', cytosisObject.results )[0].fields['Content']}</p>
			<p>{ Cytosis.find('Items Table.Dummy Item 1', cytosisObject.results )[0].fields['Content']}</p>
		</div>
		<!-- <div class="_card _padding --flat">{ Cytosis.find('Site Content.content-1', [cytosisObject.results['Items Table']] ).fields['Content']}</div> -->
		
		<h5>Finding a Record's Field (column) Data</h5>
		<p>{@html marked(`\`find(findStr, tables[], fields=['Name']) | findStr = 'tableName.recordName.fieldName'\` — sometimes you just want a specific column, like a piece of content or metadata. If a field is linked to another table, this will get an array of linked records (if it's able to find them).`)}</p>
		<div class="_card _padding --flat">
			<p>{ Cytosis.find('Site Content.filter-1.Tags', cytosisObject.results ).join(', ')}</p>
			<hr />
			<div>
				{#each Cytosis.find('Site Content.linked-item-0>3.Linked Items', cytosisObject.results) as item (item.id)}
					<p>{ item.fields['Name'] }</p>
				{/each}
			</div>
		</div>


		<h5>Finding a Record's Linked Field's Field Data (linked table lookup)</h5>
		<p>{@html marked(`\`find(findStr, tables[], fields=['Name']) | findStr = 'tableName.recordName.fieldName.linkedFieldName'\` — sometimes getting a piece of data from a linked field can be really useful, like an email or address field. In Airtable it's called a "Lookup" and we mimic that functionality here.`)}</p>
		<div class="_card _padding --flat">
			<p>{ Cytosis.find('Site Content.linked-item-0>3.Linked Items.Content', cytosisObject.results )}</p>
		</div>






		<h4>.search()</h4>
		<p>{@html marked(`\`.search()\` — while Find() takes a specially formatted query string, Search is more like a traditional string matching search.`)}</p>
		
		<h5>String matching </h5>
		<p>{@html marked(`\`search(matchStr, source, fieldsArray, linkedTableArray[], linkedTableKey) | .\` — where matchStr is the string you're trying to match, source is either an array of records or a Cytosis.results object. fieldsArray is optionally an array of the fields you're matching your results in (if you leave it blank, all fields will be searched). If you're searching records that contain linked records, but you don't want to match the linked record itself (e.g. tableOne contains a record that matches a string from the linked field "Tags" and you want to return the record from tableOne, and not the tag.`)}</p>
		<div class="_card _padding --flat">
			<p>{@html marked(`\`Cytosis.search('Content for Filter', cytosisObject.results)\`:`)}
				Records: { Cytosis.getFieldValues(Cytosis.search('Content for Filter', cytosisObject.results), 'Name').join(', ') }
			</p>
			<hr>
			<p>{@html marked(`\`Cytosis.search('SORTED', cytosisObject.results['Site Content'], {fields: ['Content']})\`:`)}
				Records: { Cytosis.getFieldValues(Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content']}), 'Name').join(', ') }
			</p>
			<hr>
			<p>{@html marked(`\`Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content'], exactMatch: true})\`:`)}
				Records: { Cytosis.getFieldValues(Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content'], exactMatch: true}), 'Name').join(', ') }
			</p>
			<hr>
			<p>{@html marked(`\`Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content'], exactMatch: true})\`:`)}
				Records: { Cytosis.getFieldValues(Cytosis.search('Filter Example', cytosisObject.results['Site Content'], {fields: ['Tags']}), 'Name').join(', ') }
			</p>
			<hr>
			<p>{@html marked(`\`Cytosis.search('Sorted', cytosisObject.results['Site Content'], {fields: ['Content'], exactMatch: true})\`: (this finds "dummy item 0" in the linked table field and returns the record that includes the linked item)`)}
				Records: { Cytosis.getFieldValues(Cytosis.search('dummy item 0', cytosisObject.results['Site Content'], {fields: ['Linked Items'], linkedTables: cytosisObject.results['Items Table']}), 'Name').join(', ') }
			</p>
		</div>





		<h3>Getter Helpers</h3>



		<h4>.getFields()</h4>
		<p>{@html marked(`\`getFields(recordArray, fieldName='Name')\` — gets the content in the form of an array of values from an array of records, given a field name. Useful for getting all the Names from a record array, in a new array. In this example we get every value from every Tag field in Site Content `)}</p>
		<div class="_card _padding --flat">
			<p>{ Cytosis.getFields(cytosisObject.results['Site Content'], 'Tags').join(', ') }</p>
			<p>{ Cytosis.getFields(cytosisObject.results['Site Content'], 'Linked Items').join(', ') }</p>
		</div>

		<h4>.getFieldContent()</h4>
		<p>{@html marked(`\`getFieldContent(recordArray, fieldName='Name')\` — gets the value of a field in the form of a 2D array, because sometimes you want to preserve the dimensionality. This means that if a field is empty, it will appear as "undefined" in the returned array. This also brings in data from linked records.`)}</p>
		<div class="_card _padding --flat">
			<p>{ Cytosis.getFieldContent(cytosisObject.results['Site Content'], 'Tags').join(', ') }</p>
			<hr>
			<div>
				{#each Cytosis.getFieldContent(cytosisObject.results['Site Content'], 'Linked Items', cytosisObject.results['Items Table']) as _arr}
					<p>{  _arr ? _arr.join(', ') : '[]' }</p>
				{/each}
			</div>
		</div>

	{/if}







</div>




<script>
	import Cytosis from '../cytosis_wip/cytosis'
  import CytosisWip from '../components/CytosisWip.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  export let title = `11. Getting and finding what you need`
  export let description = `This demo shows how to use Get, Find, and other retrieval functions`

  let cytosisObject
  let cytosisLoading = false

</script>



<style type="text/scss">
  @import '../styles/core';

  h3 {
  	@extend ._divider-top;
  }
  h4 {
  	margin-top: $unit * 2;
  }

</style>





