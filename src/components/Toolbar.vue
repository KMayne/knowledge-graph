<template>
  <md-toolbar class="toolbar">
    <span class="group">
      <span class="breadcrumb-display">
        <span v-for="graph in graphStack" :key="graph.id">
          <a class="graph-chip" href="#" @click="$emit('graphClicked', graph.id)">{{graph.name}}</a> /
        </span>
        <span class="graph-chip">
          {{ currentGraphName }}
        </span>
      </span>
    </span>
    <span class="group">
      <md-button class="md-icon-button"
        @click.stop="$emit('undo')" :disabled="!(historyState.canUndo())">
        <md-icon> undo </md-icon>
      </md-button>
      <md-button  class="md-icon-button"
        @click.stop="$emit('redo')" :disabled="!(historyState.canRedo())">
        <md-icon> redo </md-icon>
      </md-button>
    </span>
  </md-toolbar>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['current-graph-name', 'graph-stack', 'historyState']
})
</script>

<style scoped>

.toolbar {
  font-size: 24px;
  padding: 12px 12px;
  text-align: left;
  font-weight: 400;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
}

.group {
  display: inline-block;
  line-height: unset;
  line-height: 40px;
}

.graph-chip {
  border-radius: 3px;
  padding: 0px 6px;
  user-select: none;
}

.graph-chip:hover {
  background-color: rgba(53, 54, 57, 0.08);
  cursor: pointer;
}
</style>
