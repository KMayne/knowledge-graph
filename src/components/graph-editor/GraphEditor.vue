<template>
  <div>
    <Toolbar :historyState="history" :graph-stack="graphStack" :current-graph-name="graph.name"
      @graphClicked="graphId => popToGraph(graphId)" @undo="undo" @redo="redo"></Toolbar>
    <Graph :graph="graph"
      @openGraph="openGraph"
      @action="handleAction"></Graph>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ActionHistoryTree } from '@/models/ActionHistoryTree';
import GraphComponent from '../graph/Graph.vue';
import ToolbarComponent from './Toolbar.vue';
import { KnowledgeGraphModel } from '@/KnowledgeGraphModel';
import { Action } from '@/models/Action';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, NodeType } from '@/models/Node';
import { newSchemaFromDefault } from '@/models/schema-graph';

export default Vue.extend({
  name: 'GraphEditor',
  components: { Graph: GraphComponent, Toolbar: ToolbarComponent },
  mounted() {
    window.addEventListener('keypress', e => {
      if (e.ctrlKey && e.code === 'KeyZ') {
        if (e.shiftKey && this.history.canRedo()) this.redo();
        else if (this.history.canUndo()) this.undo();
      }
    });
  },
  data: () => {
    const rootGraph = KnowledgeGraphModel.loadFromStorage([{
      id: Math.random().toString(16),
      name: 'Hello',
      x: 0,
      y: 0,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      type: NodeType.Normal,
      data: {}
    }]);
    return {
      rootGraphId: rootGraph.id,
      graph: rootGraph,
      history: new ActionHistoryTree(rootGraph),
      graphStack: [] as KnowledgeGraphModel[]
    }
  },
  methods: {
    openGraph(nodeId: string) {
      this.graphStack.push(this.graph);
      const targetNode = this.graph.getNode(nodeId);
      targetNode.graph = new KnowledgeGraphModel(
        targetNode.name,
        targetNode?.graph?.nodes || [],
        targetNode?.graph?.edges || [],
        newSchemaFromDefault());
      this.graph = targetNode.graph;
      this.history = new ActionHistoryTree(this.graph);
    },
    handleAction(action: Action) {
      this.history.applyAction(action);
      this.saveGraph();
    },
    undo() {
      this.history.undo();
      this.saveGraph();
    },
    redo() {
      this.history.redo();
      this.saveGraph();
    },
    saveGraph(): void {
      localStorage.setItem('graph', (this.graphStack[0] || this.graph).serialise());
    },
    popToGraph(graphId: string) {
      const targetIdx = this.graphStack.findIndex(g => g.id === graphId);
      if (targetIdx === -1) return console.error(`Cannot find graph in stack with id "${graphId}"`);
      this.graph = this.graphStack[targetIdx];
      this.history = new ActionHistoryTree(this.graph);
      this.graphStack = this.graphStack.slice(0, targetIdx);
    },
  },
  computed: {
    breadcrumbs(): string {
      return [...this.graphStack.map(g => g.name), this.graph.name].join(' > ');
    }
  }
});
</script>

<style scoped>
</style>
