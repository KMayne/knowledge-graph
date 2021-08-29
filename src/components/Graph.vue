<template>
  <section class="graph-area"
    @dblclick="e => makeNewNode(e.clientX, e.clientY)"
    @mousedown="selectedNode = undefined">
    <Node v-for="node in graph.nodes"
      :key="node.id" :node-data="node"
      :activateOnMount="nodeToFocus === node.id"
      @mounted="() => handleNodeMount(node.id)"
      @action="a => $emit('action', a)"
    ></Node>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import NodeComponent from './Node.vue';
import { NodeAction, NodeActionType, NodeData } from '@/Node';

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 60;
export default Vue.extend({
  name: 'Graph',
  components: {
    Node: NodeComponent
  },
  props: ['graph'],
  data: () => {
    return {
      nodeToFocus: null,
    } as { nodeToFocus: string|null }
  },
  methods: {
    makeNewNode(x: number, y: number) {
      const newId = this.graph.generateId();
      this.$emit('action', new NodeAction({
        id: newId,
        text: '',
        // We want node to be centered at coords
        x: x - DEFAULT_WIDTH / 2,
        y: y - DEFAULT_HEIGHT / 2,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
      }, NodeActionType.Create));
      this.nodeToFocus = newId;
    },
    handleNodeMount(id: string) {
      if (this.nodeToFocus === id) this.nodeToFocus = null;
    }
  }
});
</script>

<style scoped>
.graph-area {
  width: 100%;
  height: 100%;
  background: #eee;
  position: relative;
}
</style>
