<template>
  <div id="app">
    <section class="graph-area" @dblclick="makeNewNode" @click="selectedNode = undefined">
      <Node v-for="node in nodes"
        :key="node.id" :node-data="node"
        :activateOnMount="nodeToFocus === node.id" @mounted="() => handleNodeMount(node.id)"
        @mousedown="selectedNode = node.id" :selected="selectedNode === node.id"
        @delete="handleDelete"
        @action="action => history.applyAction(action)"
        @textChanged="newText => { node.text = newText; saveGraph(); }"
        @nodeResized="({width, height}) => { node.width = width; node.height = height; saveGraph(); }"
      ></Node>
      <button @click="() => history.undo()">Undo</button>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NodeComponent from './components/Node.vue';
import { NodeData, NodeDelta } from './Node';
import { ActionHistoryTree } from './ActionHistoryTree';
import { Action, ActionType } from './Action';

export default Vue.extend({
  name: 'App',
  components: {
    Node: NodeComponent
  },
  mounted() {
    this.history = new ActionHistoryTree({
      apply: this.applyAction.bind(this),
      undo: this.undoAction.bind(this),
      mergeAction: this.mergeAction
    });

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
      width: 100,
      height: 80,
      id: Math.random().toString(16),
      text: 'Hello'
    }];
    this.saveGraph();
  },
  data: () => ({
    nodes: [] as Array<NodeData>,
    selectedNode: undefined,
    nodeToFocus: undefined,
    history: undefined
  } as { nodes: NodeData[], nodeToFocus?: string, selectedNode?: string , history?: ActionHistoryTree }),
  methods: {
    applyAction(action: Action) {
      switch (action.type) {
        case ActionType.NoOp:
          return;
        case ActionType.NodeChange:
          var nodeAction = action as NodeDelta;
          this.replaceNode(nodeAction.nodeId, node => ({ ...node, ...nodeAction.after }));
          return;
        default:
          console.warn('Unrecognised action:', JSON.stringify(action));
          return;
      }
    },
    undoAction(action: Action) {
      switch (action.type) {
        case ActionType.NoOp:
          return;
        case ActionType.NodeChange:
          var nodeAction = action as NodeDelta;
          this.replaceNode(nodeAction.nodeId, node => ({ ...node, ...nodeAction.before }));
          return;
        default:
          console.warn('Unrecognised action:', JSON.stringify(action));
          return;
      }
    },
    mergeAction(a: Action, b: Action): Action | undefined {
      if (a.type !== b.type || a.mergeKey != b.mergeKey) return;
      switch (a.type) {
        case ActionType.NodeChange:
          if ((a as NodeDelta).nodeId !== (b as NodeDelta).nodeId) return;
          console.log('merge success')
          return { ...(b as NodeDelta), before: (a as NodeDelta).before } as NodeDelta;
        default:
          return;
      }
    },
    handleNodeMove(node: NodeData, moveData: { deltaX: number, deltaY: number }) {
      node.x += moveData.deltaX;
      node.y += moveData.deltaY;
      this.saveGraph();
    },
    handleNodeMount(id: string) {
      if (this.nodeToFocus === id) this.nodeToFocus = undefined;
    },
    makeNewNode(e: MouseEvent) {
      const id = this.generateRandNodeId();
      this.nodes.push({
        id,
        text: '',
        x: e.clientX - 50,
        y: e.clientY - 30,
        width: 100,
        height: 60
      });
      this.nodeToFocus = id;
    },
    replaceNode(id: string, replacer: (n: NodeData) => NodeData) {
      if (id === undefined) return false;
      const idx = this.nodes.findIndex(n => n.id === id);
      this.nodes.splice(idx, 1, replacer(this.nodes[idx]));
    },
    handleDelete() {
      console.log('here')
      if (this.selectedNode === undefined) return false;
      const idx = this.nodes.findIndex(n => n.id === this.selectedNode);
      this.nodes.splice(idx, 1);
    },
    generateRandNodeId: () => Math.random().toString(16),
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
