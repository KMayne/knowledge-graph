<template>
  <div id="app">
    <section class="graph-area" @dblclick="makeNewNode">
      <Node v-for="node in nodes"
        :key="node.id" :node-data="node" :activateOnMount="nodeToFocus === node.id"
        @move="e => handleNodeMove(node, e)" @mounted="() => handleNodeMount(node.id)"
        @textChanged="newText => updateText(node, newText)"
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
    const savedGraph = localStorage.getItem('graph');
    if (savedGraph && savedGraph !== '') {
      try {
        this.nodes = JSON.parse(savedGraph);
        return;
      }
      catch (e) {
        console.error('Error occured parsing saved graph - backing up graph.');
        localStorage.setItem('graph-backup-' + (new Date()).toISOString(), savedGraph);
      }
    }
    this.nodes =  [{
      x: 50,
      y: 50,
      id: Math.random().toString(16),
      text: 'Hello'
    }];
    this.saveGraph();
  },
  data: () => ({
    nodes: [] as Array<NodeData>,
    nodeToFocus: null
  } as { nodes: NodeData[], nodeToFocus: string | null }),
  methods: {
    handleNodeMove(node: NodeData, moveData: { deltaX: number, deltaY: number }) {
      node.x += moveData.deltaX;
      node.y += moveData.deltaY;
      this.saveGraph();
    },
    handleNodeMount(id: string) {
      if (this.nodeToFocus === id) this.nodeToFocus = null;
    },
    makeNewNode(e: MouseEvent) {
      const id = this.generateRandNodeId();
      this.nodes.push({ x: e.clientX - 51, y: e.clientY - 31, id, text: '' });
      this.nodeToFocus = id;
    },
    generateRandNodeId: () => Math.random().toString(16),
    updateText(node: NodeData, text: string) {
      node.text = text;
      this.saveGraph();
    },
    saveGraph() {
      localStorage.setItem('graph', JSON.stringify(this.nodes));
    }
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
