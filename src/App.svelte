
<main class="App _section-page _margin-center">
  <HeaderSection />
  <!-- <HeroSection /> -->
  <BasicSection />
  <FooterSection />
</main>




<script>
  import { cytosis, makers, dropoff, content } from './stores.js';

  // $: if(data) {
  //   cytosis.set(data)
  //   makers.set(data.tables['Mask Makers'])
  //   dropoff.set(data.tables['Mask Dropoff'])
  //   content.set(data.tables['Site Content'])

  //   console.log('$cytosis updated: ', $cytosis )
  //   console.log('$makers updated: ', $makers )
  //   console.log('$content updated: ', $content )

  //   console.log('_cytosis updated: ', data )
  // }


  import HeaderSection from './HeaderSection.svelte'
  // import HeroSection from './HeroSection.svelte'
  import BasicSection from './BasicSection.svelte'
  import FooterSection from './FooterSection.svelte'


</script>




<style type="text/scss">
  @import './styles/core';

  // general app styles 
  // .App {
  //   width: 100%;
  //   max-width: 1500px;
  //   padding: $unit * 2;
  // }

  // * {
  //   font-family: $font-stack;
  //   font-size: $unit;
  //   line-height: $line-height;
  // }

  // :global(h1, h2, h3, h4) {
  //   font-weight: bold;
  //   padding-bottom: $unit;
  // }



</style>







