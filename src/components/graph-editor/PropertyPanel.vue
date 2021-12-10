<template>
<md-content md-tag="aside" class="panel md-elevation-4"
  @mousedown.stop @click.stop @dblclick.stop @touchstart.stop>
  <node-detail v-show="targetType === 'node'" :node="target" :graph="graph"
    @action="a => $emit('action', a)"></node-detail>
  <edge-detail v-show="targetType === 'edge'" :edge="target" :graph="graph"
    @action="a => $emit('action', a)"></edge-detail>
</md-content>
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
  props: ['target', 'targetType', 'graph']
});
</script>

<style>
.panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 30%;
  max-width: 400px;
  font-size: 18px;
}


section.detail-panel {
  text-align: left;
}

h4 {
  margin: 8px 0;
  font-weight: bold;
}
</style>
