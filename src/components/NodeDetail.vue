<template>
<section>
 <h3>{{node.text}}</h3>
</section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ['node']
});
</script>
