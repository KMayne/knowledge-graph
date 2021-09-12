<template>
<aside class="panel">
  <node-detail v-if="targetType === 'node'" :node="target"></node-detail>
  <edge-detail v-if="targetType === 'edge'" :edge="target"></edge-detail>
</aside>
</template>

<script lang="ts">
import Vue from 'vue';
import NodeDetail from './NodeDetail.vue'
import EdgeDetail from './EdgeDetail.vue'

export default Vue.extend({
  components: {
    NodeDetail,
    EdgeDetail
  },
  props: ['target', 'targetType']
});
</script>

<style scoped>
.panel {
  margin: auto;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 30%;
  max-width: 400px;
  background: white;
  z-index: 10000;
}
</style>
