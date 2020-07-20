<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<p class="">{@html marked(more) }</p>

  <h4 class="_margin-top-2">Creating Multiple Values</h4>
  <p class="">{@html marked(createMultiple) }</p>

  <div class="Formlet Formlet-input _form-control" >
    <label class="_form-label" >Type your pet's name, what kind of animal it is, and some tags (if you want)!</label>
    <div class="_action _flex-row-sm _padding-top-half">
      <input class="_form-input __width-full _margin-right" type="text" bind:value={petName} placeholder="Type your pet name" />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={animalName} placeholder="Animal type, e.g. 'Cat' or 'Dog'" />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={tags} placeholder="Type tag like 'fluffy, 'derpy'"  />
      <button class="_button _flex-1 __outline __short _margin-bottom-none __nowrap" on:click={addPetToArray}>Add Pet</button>
    </div>

    {#if petArray.length > 0}
      <div class="_card _padding">
        {#each petArray as pet}
          <div class="">{pet['Name']} {pet['Animal']} {pet['Tags']}</div>
        {/each}
        <div>
          <button class="_button _flex-1 __outline __short _margin-top _margin-bottom-none __nowrap" on:click={savePets}>Save these to Airtable</button>
        </div>
      </div>
    {/if}
  </div>
  
  <h4 class="_margin-top-2">Updating, Replacing, Deleting Multiple Values</h4>
  <p class="">{@html marked(updateReplaceTables) }</p>

  {#if petResults.length > 0}
    <div class="_card _padding">
      {#each petResults as pet, i}
        <div class="Formlet Formlet-input _form-control" >
          <label class="_form-label" >Edit the pets you just entered!</label>
          <div class="_action _flex-row-sm _padding-top-half">
            <input class="_form-input __width-full _margin-right" type="text" bind:value={pet.fields['Name']} placeholder="Type your pet name" />
            <input class="_form-input __width-full _margin-right" type="text" bind:value={pet.fields['Animal']} placeholder="Animal type, e.g. 'Cat' or 'Dog'" />
            <input class="_form-input __width-full _margin-right" type="text" bind:value={pet.fields['Tags']} placeholder="Type tag like 'fluffy, 'derpy'"  />
            <button class="_button _flex-1 __outline __short _margin-bottom-none __nowrap" on:click={()=> {removePet(petResults[i].id, i)}}>Remove</button>
          </div>
        </div>

      {/each}
      <div>
        <button class="_button _flex-1 __outline __short _margin-top _margin-bottom-none __nowrap" on:click={()=> {updateReplacePetData()}}>Update pet data</button>
        <button class="_button _flex-1 __outline __short _margin-top _margin-bottom-none __nowrap" on:click={()=> {updateReplacePetData('replace')}}>Replace pet data</button>
      </div>
    </div>

  {:else}
    <div class="_card _padding">
      To test out Updating, Replacing, or Deleting data, please add one or more animals in the previous section!
    </div>
  {/if}


  
  <CytosisWip
    options={{
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      configName: 'pets-all',
      routeDetails: 'Demo Twelve',
    }}
    bind:loadCytosis={loadCytosis}
    bind:isLoading={cytosisLoading}
    bind:cytosis={cytosisObject}
  >
    {#if cytosisLoading}
      ... loading Cytosis object ...
    {/if}
    {#if cytosisObject}
      <h4 class="_margin-top-2">Received Airtable Data</h4>
      <div class="_card _padding --flat">
        {#each cytosisObject.results['Pets'] as pet (pet.id)}
          <div class="pet">{@html marked(pet.fields['Name'])} | Animal: {pet.fields['Animal']} | tags: { pet.fields['Tags'] ? pet.fields['Tags'].join(', ') : '(no tags)' }</div> 
        {/each}
      </div>
    {/if}
  </CytosisWip>
</div>




<p class="_divider-top">Here's what the actual Airtable looks like:</p>
<iframe title="Airtable example source" class="airtable-embed" src="https://airtable.com/embed/shrW9Hz9VT2zhxDQ7?backgroundColor=cyan" frameborder="0" onmousewheel="" width="100%" height="533" style="background: transparent; border: 1px solid #ccc;"></iframe>






<script>
	import Cytosis from '../cytosis_wip/cytosis'
  import CytosisWip from '../components/CytosisWip.svelte'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  export let title = `13. Saving and Deleting Multiple Objects`
  export let description = `This demo shows how to save using arrays of objects using the bulk create or update function.`
  export const more = `⚠️ Be careful! If you expose an Editor user's API key to your table to the browser, anyone can add, edit, or delete the contents on your table. You need to either use a server (or serverless/microservice), or create a second table that protects the content from the main table. Then, you can create a second user, and share your table with that user with Read Only or Editor permissions, and you can use that user's API key to access the table.

To add new items like linked tables and single and multiple select values, you can use "typecast" which creates new items in Airtable. For this to work, make sure the API key's user has **Creator Access** and not merely editor access. This works for both single and multiple select fields and linked fields
`

  export const createMultiple = `Use saveArray() to save multiple items by passing an array of objects into 'payload'. Note that the Airtable API only allows ten items to be saved at once. Linked item creation is supported through typecasting (needs Creator-level access).

~~~
  saveArray({payload, tableName, apiKey, baseId, cytosis, tableOptions, type="create"})
~~~
`

  export const updateReplaceTables = `Updating and Replacing works very similarly to Saving. The difference is that each object requires an 'id' field, and the type needs to specify 'update' or 'replace'
`




  /*
    - matchKeywordWithField
      - show a few field settings
      - show partial — a piece of text appears in a field
      - show regular — for example retrieving a slug or page name


  */

  let status, petName = "", tags = undefined, animalName = null, animalNote = null
  let cytosisObject, loadedConfig, loadCytosis
  let cytosisLoading = false

  let petArray = [], petResults = []

  const addPetToArray = async() => {
    petArray.push({
     Name: petName, 
     Animal: animalName,
     Tags: tags
    })
    petArray = petArray
    animalName = ""
    petName = ""
    tags = ""
  }


  const savePets = async() => {
    petResults = await Cytosis.saveArray({
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      tableName: 'Pets',
      tableOptions: {
        insertOptions: ['typecast'],
      },
      payload: petArray,
    })
    
    animalName = ""
    petName = ""
    tags = ""

    // console.log('save results:', petResults)
    await loadCytosis()
  }

  const updateReplacePetData = async(type='update') => {
    console.log('updateReplacePetData', type, petResults)

    petResults.map((pet) => {
      delete pet.fields['Created time'] // computed fields aren't ignored by the API
    })

    let newResults = await Cytosis.saveArray({
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      tableName: 'Pets',
      tableOptions: {
        insertOptions: ['typecast'],
      },
      type: type,
      payload: petResults,
    })
    
    animalName = ""
    petName = ""
    tags = undefined

    petResults = newResults
    // console.log('save results:', petResults)
    await loadCytosis()
  }

  const removePet = async(id, i) => {
    let deleteResult = await Cytosis.delete({
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      tableName: 'Pets',
      recordId: id,
    })
    
    // update local results
    petResults.splice(i,1); petResults = petResults;
    animalName = ""
    petName = ""
    tags = undefined

    console.log('Delete resluts:', deleteResult)
    await loadCytosis()
  }

  const getPetNames = (pet) => {
    const animals = Cytosis.getByIds(pet.fields['Animal'], cytosisObject.results['Animals'])
    let pets = []
    animals.map((pet) => {
      pets.push(pet.fields['Name'])
    })

    return pets.join(', ')
  }

  // $: console.log(cytosisObject)

</script>



<style type="text/scss">
  @import '../styles/core';

  .__nowrap {
    white-space: nowrap;
  }

  .submit-button {
    line-height: 0;
  }

  .pet {
    :global(p) {
      display: inline !important;
    }
  }

</style>





