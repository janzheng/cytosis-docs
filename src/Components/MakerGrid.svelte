
<!-- 
<Cytosis 
	tableName={'Mask Makers'} 
	airKey={'keylYLkFHWTY3b8Ca'} 
	airBase={'appU40RlkLFNfoQ3X'} 
  tableQuery={'mask-makers'}
  routeName={'mask-makers'}
  bind:cytosis={$cytosis}
  bind:table={$makers}
> -->
	<div>
		{#if $makers}
			<ul class="maker-grid">
				{#each $makers as item (item.id)}
					{#if item.fields.Photos && item.fields.Photos.length > 0}
						<div class="maker-item-container">
							<div class="maker-item">
								<img alt="{item.fields.Name} thumbnail" src={item.fields.Photos[0].thumbnails.large.url} />
								<div class="maker-desc">
									<div class="maker-name">{item.fields['Name']}</div>
									<div class="maker-location">{item.fields['Location']}</div>
									{#if item.fields['Donation & Pricing Info']}
										<div class="maker-pricing">{@html marked(item.fields['Donation & Pricing Info'])}</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</ul>
		{/if}
	</div>
<!-- </Cytosis> -->





<script>
  import { cytosis, makers, content } from '../stores.js';
  import Cytosis from './Cytosis.svelte'
	import marked from 'marked'

	// $: let _cytosis, _makers // bound from pass-through slot
  // cytosis.update(_cytosis)
  // makers.update(_makers)
  // content.set(cytosis.tables['content'])

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  // $: console.log('$cytosis updated: ', {$cytosis} )
  // $: console.log('$makers updated: ', {$makers} )
  // $: console.log('$content updated: ', {content} )

</script>




<style type="text/scss">
  .maker-grid {
    list-style: none;

    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  	position: relative;

    img {
		  width: 100%;
		  height: 250px;
      object-fit: cover;
    }
  }

  .maker-item-container {
  	border-radius: 6px;

  	.maker-item {
  		// display: flex;
  	}
  }

  .maker-desc {
  	background-color: white;
  	padding: 8px;
  	text-align: left;
  }
</style>



