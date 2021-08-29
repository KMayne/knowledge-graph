<template>
  <line :x1="edge.fromX" :y1="edge.fromY"
        :x2="edge.toX" :y2="edge.toY"
        :tabindex="0" :class="{ 'show-hover': !noHover }"
        @keydown="handleKeyDown"
  />
</template>

<script lang="ts">
import { EdgeAction, EdgeActionType } from '@/Edge';
import Vue from 'vue';

export default Vue.extend({
  name: 'Edge',
  props: ['edge', 'noHover'],
  methods: {
    handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Delete') {
        this.$emit('action', new EdgeAction(this.edge, EdgeActionType.Delete));
      }
    }
  }
});
</script>

<style scoped>
line {
  stroke: black;
  stroke-width: 4px;
}

line:focus {
  stroke: rgb(117, 167, 248);
  outline: none;
}

line.show-hover:hover:not(:focus) {
  stroke: rgb(182, 207, 255);
  stroke-width: 6px;
}
</style>
