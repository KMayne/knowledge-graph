<template>
  <div id="app">
    <section class="graph-area" @dblclick="makeNewNode" @click="selectedNode = undefined">
      <Node v-for="node in graph.nodes"
        :key="node.id" :node-data="node"
        :activateOnMount="nodeToFocus === node.id" @mounted="() => handleNodeMount(node.id)"
        @click="selectedNode = node.id" :selected="selectedNode === node.id"
        @delete="() => deleteNode()"
        @action="action => history.applyAction(action)"
      ></Node>
      <button @click.stop="() => history.undo()" :disabled="undoDisabled">Undo</button>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NodeComponent from './components/Node.vue';
import { NodeAction, NodeActionType } from './Node';
import { ActionHistoryTree } from './ActionHistoryTree';
import { KnowledgeGraphModel } from './KnowledgeGraphModel';

export default Vue.extend({
  name: 'App',
  components: {
    Node: NodeComponent
  },
  mounted() {
    window.addEventListener('keyup', e => {
      if (e.ctrlKey && e.code === 'KeyZ') {
        if (this.history.canUndo()) this.history.undo();
      } else if (e.code === 'Delete') {
        this.deleteNode();
      }
    });
  },
  data: () => {
    const graph = KnowledgeGraphModel.loadFromStorage([{
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      id: Math.random().toString(16),
      text: 'Hello'
    }]);
    return {
      graph,
      selectedNode: null,
      nodeToFocus: null,
      history: new ActionHistoryTree(graph)
    } as { graph: KnowledgeGraphModel, selectedNode: string|null, nodeToFocus: string|null, history: ActionHistoryTree }
  },
  computed: {
    undoDisabled() { return !(this?.history.canUndo() ?? false); }
  },
  methods: {
    handleNodeMount(id: string) {
      if (this.nodeToFocus === id) this.nodeToFocus = null;
    },
    makeNewNode(e: MouseEvent) {
      const newId = this.graph.generateId();
      this.history.applyAction(new NodeAction({
        id: newId,
        text: '',
        x: e.clientX - 50,
        y: e.clientY - 30,
        width: 100,
        height: 60
      }, NodeActionType.Create));
      this.nodeToFocus = newId;
    },
    deleteNode() {
      const nodeToDelete = this.graph.nodes.find(n => n.id === this.selectedNode);
      if (nodeToDelete === undefined) return false;
      this.history.applyAction(new NodeAction(nodeToDelete, NodeActionType.Delete));
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
