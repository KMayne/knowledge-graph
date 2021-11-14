<template>
<section class="detail-panel">
  <h4>Node properties</h4>
  <md-field>
    <label>Text</label>
    <md-input :value="node.text" @input="handleTextChange"></md-input>
  </md-field>
  <md-field>
    <label>Type</label>
    <md-select :value="node.type" @input="handleTypeChange">
      <md-option v-for="type in nodeTypes" :value="type[0]" :key="type[0]">{{ type[1] }}</md-option>
    </md-select>
  </md-field>
</section>
</template>

<script lang="ts">
import { NodeChange, UserNodeTypes } from '@/Node';
import Vue from 'vue';
import { NodeType }  from '@/Node';

export default Vue.extend({
  props: ['node'],
  methods: {
    handleTextChange(newText: string) {
      this.$emit('action', new NodeChange(this.node.id, { text: this.node.text },
        { text: newText }, `text-change[${this.node.id}`));
    },
    handleTypeChange(newType: NodeType) {
      this.$emit('action', new NodeChange(this.node.id, { type: this.node.type },
        { type: newType }, `type-change[${this.node.id}`));
    },
  },
  computed: {
    nodeTypes: () => {
      return UserNodeTypes.map(t => [t, NodeType[Number(t)]]);
    }
  }
});
</script>

<style scoped>
h4 {
  margin: 8px 0 24px 0;
}
</style>
