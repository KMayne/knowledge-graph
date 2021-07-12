<template>
  <div id="app">
    <section class="graph-area" @dblclick="makeNewNode">
      <Node v-for="node in nodes"
        :key="node.id" :node-data="node" :activateOnMount="nodeToFocus === node.id"
        @move="e => handleNodeMove(node, e)" @mounted="() => handleNodeMount(node.id)"
      ></Node>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Node from './components/Node.vue';
import { NodeData } from './node-data';


export default Vue.extend({
  name: 'App',
  components: {
    Node
  },
  mounted() {
    document.addEventListener('mousemove', console.log)
  },
  data: () => ({
    nodes: [{
      x: 50,
      y: 50,
      id: Math.random().toString(16),
      text: 'Hello'
    }] as Array<NodeData>,
    nodeToFocus: null
  } as { nodes: NodeData[], nodeToFocus: string | null }),
  methods: {
    handleNodeMove(node: NodeData, moveData: { deltaX: number, deltaY: number }) {
      node.x += moveData.deltaX;
      node.y += moveData.deltaY;
    },
    handleNodeMount(id: string) {
      if (this.nodeToFocus === id) this.nodeToFocus = null;
    },
    makeNewNode(e: MouseEvent) {
      const id = this.generateRandNodeId();
      console.log(e)
      this.nodes.push({ x: e.clientX - 51, y: e.clientY - 31, id, text: '' });
      this.nodeToFocus = id;
    },
    generateRandNodeId: () => Math.random().toString(16)
  }
});
</script>

<style>
#app {
  height: 100%;
  box-sizing: border-box;
  font-family: Segoe UI;
  text-align: center;
  overflow: hidden;
}

.graph-area {
  width: 100%;
  height: 100%;
  background: #eee;
  position: relative;
}
</style>
