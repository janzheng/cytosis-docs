<svelte:options accessors/>

<div class="">
	<h2>{ title }</h2>
	<div>{@html marked(description) }</div>

	<p class="">{@html marked(more) }</p>


  <div class="Formlet Formlet-input _form-control" >
    <label class="_form-label" >Type your pet's name, what kind of animal it is, and some tags (if you want)!</label>
    <div class="_action _flex-row-sm _padding-top-half">
      <input class="_form-input __width-full _margin-right" type="text" bind:value={petName} placeholder="Type your pet name" />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={animalName} placeholder="Animal type, e.g. 'Cat' or 'Dog'" />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={tags} placeholder="Type tag like 'fluffy, 'derpy'"  />
      <input class="submit-button _button _flex-1 __outline __short _margin-bottom-none " type="submit" on:click={addPet}>
    </div>
  </div>

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
      <div class="_card _padding --flat">
        {#each cytosisObject.results['Pets'] as pet (pet.id)}
          <div class="pet">{@html marked(pet.fields['Name'])} | Animal: {pet.fields['Animal']} | tags: { pet.fields['Tags'] ? pet.fields['Tags'].join(', ') : '(no tags)' }</div> 
        {/each}
      </div>
    {/if}
  </CytosisWip>
  

  <h4 class="_margin-top-2">Linked Tables</h4>
  <p class="">{@html marked(linkedTables) }</p>

  {#if cytosisLoading}
    ... loading Cytosis object ...
  {/if}
  {#if cytosisObject}
    <div class="_card _padding --flat">
      {#each cytosisObject.results['Pets'] as pet (pet.id)}
        <div class="pet">{@html marked(pet.fields['Name'])} | Animal: { getPetNames(pet) } | tags: { pet.fields['Tags'] ? pet.fields['Tags'].join(', ') : '(no tags)' }</div> 
      {/each}
    </div>
  {/if}


  <h4 class="_margin-top-2">Saving Linked Tables</h4>
  <p class="">{@html marked(savingLinkedTables) }</p>
  <div class="Formlet Formlet-input _form-control" >
    <label class="_form-label" >Type your pet's name, what kind of animal it is, and some tags (if you want)!</label>
    <div class="_action _flex-row-sm _padding-top-half">
      <input class="_form-input __width-full _margin-right" type="text" bind:value={petName} placeholder="Type your pet name" />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={animalName} placeholder="Animal type, e.g. 'Cat' or 'Dog'" />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={animalNote} placeholder="A note about the animal"  />
      <input class="_form-input __width-full _margin-right" type="text" bind:value={tags} placeholder="Type tag like 'fluffy, 'derpy'"  />
      <input class="submit-button _button _flex-1 __outline __short _margin-bottom-none " type="submit" on:click={addLinkedPet}>
    </div>
  </div>

  
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

  export let title = `12. Saving to Cytosis`
  export let description = `This demo shows how to use a form to save directly to Cytosis.`
  export const more = `⚠️ Be careful! If you expose an Editor user's API key to your table to the browser, anyone can add, edit, or delete the contents on your table. You need to either use a server (or serverless/microservice), or create a second table that protects the content from the main table. Then, you can create a second user, and share your table with that user with Read Only or Editor permissions, and you can use that user's API key to access the table.

To add new items like linked tables and single and multiple select values, you can use "typecast" which creates new items in Airtable. For this to work, make sure the API key's user has **Creator Access** and not merely editor access. This works for both single and multiple select fields and linked fields
`

  export const linkedTables = `You might have noticed the Animal field is a linked table, and doesn't show up properly, because it's in another table (Animals). For those to show up, you have to get the linked record with 'getLinkedRecords'
`

  export const savingLinkedTables = `Here is an example of how to save to linked tables with Cytosis' insertLinked() function, which doesn't require typecasting. (However, do note that new Multi Select items still need typecasting and Creator permissions to create new options)
`




  /*
    - matchKeywordWithField
      - show a few field settings
      - show partial — a piece of text appears in a field
      - show regular — for example retrieving a slug or page name


  */

  let status, petName = "", tags = "", animalName = null, animalNote = null
  let cytosisObject, loadedConfig, loadCytosis
  let cytosisLoading = false

  const addPet = async() => {
    await Cytosis.save({
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      tableName: 'Pets',
      tableOptions: {
        insertOptions: ['typecast'],
      },
      payload: {
        Name: petName,
        Animal: animalName,
        Tags: tags.length > 0 ? tags.split(',').map(item => item.trim()) : null,
      }
    })
    petName = ""
    tags = ""

    await loadCytosis()
  }

  const addLinkedPet = async() => {
    console.log('adding a linked pet!')
    await Cytosis.save({
      apiKey: 'keyIXVoSGhtPXrTnI',
      baseId: 'app9xsC0ykwoAYHoC',
      tableName: 'Pets',
      tableOptions: {
        insertOptions: ['typecast'],
        linkedObjects: [{key: 'Name', field:'Animal', table: 'Animals'}],
      },
      payload: {
        Name: petName,
        Animal: {
          'Name': animalName,
          'Notes': animalNote,
        },
        Tags: tags.length > 0 ? tags.split(',').map(item => item.trim()) : null,
      }
    })
    petName = ""
    tags = ""
    animalName = ""
    animalNote = ""

    await loadCytosis()
  }


  const getPetNames = (pet) => {
    const animals = Cytosis.getLinkedRecords(pet.fields['Animal'], cytosisObject.results['Animals'], true)
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

  .submit-button {
    line-height: 0;
  }

  .pet {
    :global(p) {
      display: inline !important;
    }
  }

</style>





