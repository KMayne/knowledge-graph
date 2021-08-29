<template>
  <div>
    <div class="toolbar">
      <button @click.stop="() => history.undo()" :disabled="!(history.canUndo())">Undo</button>
      <button @click.stop="() => history.redo()" :disabled="!(history.canRedo())">Redo</button>
    </div>
    <Graph :graph="graph" @action="handleAction"></Graph>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ActionHistoryTree } from '@/ActionHistoryTree';
import Graph from './Graph.vue';
import { KnowledgeGraphModel } from '@/KnowledgeGraphModel';
import { Action } from '@/Action';

export default Vue.extend({
  name: 'MainPage',
  components: { Graph },
  mounted() {
    window.addEventListener('keypress', e => {
      if (e.ctrlKey && e.code === 'KeyZ') {
        if (e.shiftKey && this.history.canRedo()) this.history.redo();
        else if (this.history.canUndo()) this.history.undo();
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
      history: new ActionHistoryTree(graph)
    }
  },
  methods: {
    handleAction(action: Action) {
      this.history.applyAction(action);
    }
  }
});
</script>

<style scoped>

</style>
