<template>
<section class="detail-panel">
  <h4>Node properties</h4>
  <md-field>
    <label>Text</label>
    <md-input :value="node.text" @input="handleInput"></md-input>
  </md-field>
</section>
</template>

<script lang="ts">
import { NodeChange } from '@/Node';
import Vue from 'vue';

export default Vue.extend({
  props: ['node'],
  methods: {
    handleInput(newText: string) {
      this.$emit('action', new NodeChange(this.node.id, { text: this.node.text },
        { text: newText }, `text-change[${this.node.id}`));
    }
  }
});
</script>

<style scoped>
h4 {
  margin: 8px 0 24px 0;
}
</style>
