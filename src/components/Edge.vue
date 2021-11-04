<template>
  <path :d="pathSpec"
        :style="{ transform: `scale(${scale})` }"
        :tabindex="0" :class="{ 'show-hover': !noHover, selected }"
        @keydown="handleKeyDown"
        @focus="$emit('focus')"
        @touchstart="$emit('focus')"
        @blur="$emit('blur')"
  />
</template>

<script lang="ts">
import { EdgeAction, EdgeActionType, EdgeDirection } from '@/Edge';
import Vue from 'vue';

const ARROW_SIZE = 16;
export default Vue.extend({
  name: 'Edge',
  props: ['edge', 'noHover', 'selected', 'offsetX', 'offsetY', 'scale'],
  methods: {
    handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Delete') {
        this.$emit('action', new EdgeAction(this.edge, EdgeActionType.Delete));
      }
    }
  },
  computed: {
    pathSpec() {
      const { toX, fromX, toY, fromY } = this.edge;
      const pathVector = [toX - fromX, toY - fromY];
      // Don't draw if the line is to itself
      if (pathVector.every(x => x === 0)) return 'm0,0';
      const pathLength = Math.sqrt(Math.pow(pathVector[0], 2) + Math.pow(pathVector[1], 2));
      const pathBasis = pathVector.map(a => a / pathLength)
      const preArrowPoint = pathVector.map(v => v * (0.5 - ARROW_SIZE / pathLength / Math.sqrt(3)
        * (this.edge.direction === EdgeDirection.Bidirectional ? 2 : 1)));
      const arrowSvg = (() => {
        const rotatedPathOp = (pathOp: string, x: number, y: number) =>
          `${pathOp}${x * pathBasis[0] + y * pathBasis[1]},${x * pathBasis[1] - y * pathBasis[0]}`;
        switch (this.edge.direction) {
          case EdgeDirection.Undirected:
            return rotatedPathOp('l', ARROW_SIZE / Math.sqrt(3), 0);
          case EdgeDirection.Directional:
            return rotatedPathOp('m', 0, ARROW_SIZE / 2) +
              rotatedPathOp('l', 0, -ARROW_SIZE) +
              rotatedPathOp('l', ARROW_SIZE * 2 / Math.sqrt(3), ARROW_SIZE / 2) +
              rotatedPathOp('l', -ARROW_SIZE * 2 / Math.sqrt(3), ARROW_SIZE / 2) +
              rotatedPathOp('l', 0, -ARROW_SIZE / 2) +
              rotatedPathOp('m', ARROW_SIZE, 0);
          case EdgeDirection.Bidirectional:
            return (
              // Top point
              rotatedPathOp('l', ARROW_SIZE * 2 / Math.sqrt(3), ARROW_SIZE / 2) +
              // Right point
              rotatedPathOp('l', ARROW_SIZE * 2 / Math.sqrt(3), -ARROW_SIZE / 2) +
              // Bottom point
              rotatedPathOp('l', -ARROW_SIZE * 2 / Math.sqrt(3), -ARROW_SIZE / 2) +
              // Left point
              rotatedPathOp('l', -ARROW_SIZE * 2 / Math.sqrt(3), ARROW_SIZE / 2) +
              // Move to right point again
              rotatedPathOp('m', ARROW_SIZE * 4 / Math.sqrt(3), 0)
            );
        }
      })();
      return `M${fromX + this.offsetX},${fromY + this.offsetY}
              l${preArrowPoint.join(',')}
              ${arrowSvg}
              L${toX + this.offsetX},${toY + this.offsetY}`;
    }
  }
});

</script>

<style scoped>
path {
  stroke: #616161;
  fill: #616161;
  fill: white;
  stroke-linecap: butt;
  stroke-width: 3px;
  transform-origin: 50vw 50vh;
}

path.show-hover:hover:not(:focus) {
  stroke: #b6cfff;
  stroke-width: 4px;
  fill: #b6cfff;
  fill: white;
}

path:focus, path.selected {
  stroke: #75a7f8;
  stroke-width: 4px;
  outline: none;
  fill: #75a7f8;
  fill: white;
}
</style>
