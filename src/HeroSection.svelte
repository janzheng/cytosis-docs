
<div class="Hero-section">
	<div class="Hero">
		<h2>“My mask protects you, your mask protects me.”</h2>
		<h3>#maskfashion: discover mask makers</h3>
	</div>
	<div>
		{@html marked(explainer)}
		<!-- At Mask Fashion, we are trying to normalize mask wearing in order to create a safer place for everyone. With the Coronavirus pandemic, the CDC recommends everyone wear a mask in order to mitigate the risk for spreading the virus. So, let's get creative with our masks! Let's encourage displaying and wearing awesome, great-looking masks in public. I used to feel weird wearing my mask outside, but now with more people doing it, I feel better about wearing mine in public. -->
	</div>
</div>



<script>
  import { content } from './stores.js';
	import _cytosis from 'cytosis'
	import marked from 'marked'

  marked.setOptions({
    gfm: true,
    breaks: true,
  })

	$: console.log('content?', $content)
	// let body = 'text'

	let explainer = ''
  $: if($content) {
  	explainer = _cytosis.findField('explainer', $content, 'Markdown' )
  }

</script>

<style type="text/scss">
  @import './styles/core';

</style>


