<template>
  <div>
    <div class="toolbar">
      <span class="breadcrumb-display">
        <span v-for="graph in graphStack" :key="graph.id">
          <a href="#" @click="popToGraph(graph.id)">{{graph.name}}</a> &gt;
        </span>
        {{graph.name}}
      </span>
      <button @click.stop="() => history.undo()" :disabled="!(history.canUndo())">Undo</button>
      <button @click.stop="() => history.redo()" :disabled="!(history.canRedo())">Redo</button>
    </div>
    <Graph :graph="graph"
      @openGraph="openGraph"
      @action="handleAction"></Graph>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ActionHistoryTree } from '@/ActionHistoryTree';
import GraphComponent from './Graph.vue';
import { KnowledgeGraphModel } from '@/KnowledgeGraphModel';
import { Action } from '@/Action';

export default Vue.extend({
  name: 'MainPage',
  components: { Graph: GraphComponent },
  mounted() {
    window.addEventListener('keypress', e => {
      if (e.ctrlKey && e.code === 'KeyZ') {
        if (e.shiftKey && this.history.canRedo()) this.history.redo();
        else if (this.history.canUndo()) this.history.undo();
      }
    });
  },
  data: () => {
    const rootGraph = KnowledgeGraphModel.loadFromStorage([{
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      id: Math.random().toString(16),
      text: 'Hello'
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
      targetNode.graph = new KnowledgeGraphModel(targetNode.text, targetNode?.graph?.nodes || [], targetNode?.graph?.edges || []);
      this.graph = targetNode.graph;
      this.history = new ActionHistoryTree(this.graph);
    },
    handleAction(action: Action) {
      this.history.applyAction(action);
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
      this.graphStack = this.graphStack.slice(0, targetIdx - 1);
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
