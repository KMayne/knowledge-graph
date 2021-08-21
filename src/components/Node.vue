<template>
  <div ref="node" class="node" @mousedown="dragStart"
    @mousedown.stop="e => $emit('mousedown', e)" @dblclick="handleDblClick" :style="nodeStyle"
    @keyup.delete="() => $emit('delete')" @click.stop="() => {}">
    <p contenteditable @input="handleInput" ref="textBox" type="text" class="text-box">
      {{ nodeText }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { NodeData, NodeDelta } from '../Node';

export default Vue.extend({
  name: 'Node',
  props: ['nodeData', 'activateOnMount', 'selected'],
  data: () => ({
    isBeingDragged: false,
    mousePageOffset: {
      x: 0,
      y: 0
    },
    nodeText: ''
  }),
  mounted() {
    this.nodeText = this.nodeData.text;
    if (this.activateOnMount) {
      this.startEdit();
    }
    this.$emit('mounted');
  },
  methods: {
    handleInput(e: InputEvent) {
      this.$emit('textChanged', (e?.target as HTMLElement).innerText);
    },
    dragStart(e: MouseEvent) {
      document.addEventListener('mouseup', this.dragStop);
      // If we're not dragging the textbox, then we must be using the resize handle
      // so allow the default operation
      if ((e?.target as HTMLElement).tagName !== 'P') return true;
      document.addEventListener('mousemove', this.handleMove);
      this.isBeingDragged = true;
      this.mousePageOffset = {
        x: e.clientX,
        y: e.clientY
      };
      e.preventDefault();
    },
    dragStop(e: Event) {
      e.preventDefault();
      document.removeEventListener('mousemove', this.handleMove);
      document.removeEventListener('mouseup', this.dragStop);
      this.isBeingDragged = false;

      const node = this.$refs?.node as HTMLElement;
      if (node.scrollWidth !== this.nodeData.width || node.scrollHeight !== this.nodeData.height) {
        this.$emit('nodeResized', { width: node.scrollWidth, height: node.scrollHeight });
      }
    },
    handleMove(e: Event) {
      const mouseEvent = e as MouseEvent;
      const deltaX = mouseEvent.clientX - this.mousePageOffset.x;
      const deltaY = mouseEvent.clientY - this.mousePageOffset.y;
      this.mousePageOffset = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY
      };
      this.$emit('move', { deltaX, deltaY });
      const x = this.nodeData.x;
      const y = this.nodeData.y;
      this.$emit('action', new NodeDelta(this.nodeData.id, { x, y }, { x: x + deltaX, y: y + deltaY }, 'move'));
    },
    handleDblClick(e: MouseEvent) {
      e.stopPropagation();
      this.startEdit();
    },
    startEdit() {
      (this.$refs?.textBox as HTMLElement).focus();
    }
  },
  computed: {
    nodeStyle() {
      return {
        left: this.nodeData.x + 'px',
        top: this.nodeData.y + 'px',
        width: this.nodeData.width + 'px',
        height: this.nodeData.height + 'px',
        ...(this.selected ? { border: '3px solid black' } : {})
      };
    }
  }
});
</script>

<style scoped>
.node {
  border: 1px solid black;
  background: white;
  position: absolute;
  resize: both;
  overflow: hidden;
}

.dragging {
  cursor: move !important;
}

.text-box {
  cursor: default;
  width: 100%;
  height: 100%;
  border: none;
  box-sizing: border-box;
  text-align: center;
  font-size: 24px;
  margin: 0;
  padding: 15px 10px;
}
</style>
