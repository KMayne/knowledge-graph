<template>
<section class="detail-panel">
  <h4>Edge properties</h4>
  <md-field>
  <md-select @input="directionChanged" :value="edge.direction">
    <md-option v-for="(dir, idx) in directionOptions" :value="idx" :key="idx">{{dir}}</md-option>
  </md-select>
  </md-field>
</section>
</template>

<script lang="ts">
import { EdgeChange, EdgeDirection } from '@/Edge';
import Vue from 'vue';

export default Vue.extend({
  props: ['edge', 'graph'],
  methods: {
    directionChanged(newDirection: EdgeDirection) {
      const before = { direction: this.edge.direction };
      const after = { direction: newDirection }
      this.$emit('action', new EdgeChange(this.edge.id, before, after, 'direction'));
    }
  },
  computed: {
    directionOptions: () => [
      EdgeDirection[EdgeDirection.Undirected],
      EdgeDirection[EdgeDirection.Directional],
      EdgeDirection[EdgeDirection.Bidirectional]
    ]
  }
});
</script>

<style scoped>

</style>
