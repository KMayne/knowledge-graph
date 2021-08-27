<template>
  <div ref="node" class="node" @mousedown="dragStart" @touchstart="touchStart"
    @click.stop="handleClick" @dblclick.stop="startEdit" :style="nodeStyle">
    <p contenteditable @input="handleInput" ref="textBox" type="text"
     class="text-box" :style="selected ? { padding: '12px 7px' } : {}">
      {{ nodeText }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { NodeChange } from '../Node';

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
      this.$emit('action', new NodeChange(this.nodeData.id, { text: this.nodeData.text },
        { text: (e?.target as HTMLElement).innerText }, `text-change[${this.nodeData.id}`));
    },
    handleClick(e: MouseEvent) {
      this.$emit('click', e);
    },
    touchStart(e: TouchEvent) {
      document.addEventListener('touchend', this.dragStop);
      document.addEventListener('touchcancel', this.dragStop);
      // If we're not dragging the textbox, then we must be using the resize handle
      // so allow the default operation
      if ((e?.target as HTMLElement).tagName !== 'P') return true;
      document.addEventListener('touchmove', this.handleTouchMove);
      this.isBeingDragged = true;
      this.mousePageOffset = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      e.preventDefault();
    },
    dragStart(e: MouseEvent) {
      document.addEventListener('mouseup', this.dragStop);
      // If we're not dragging the textbox, then we must be using the resize handle
      // so allow the default operation
      if ((e?.target as HTMLElement).tagName !== 'P') return true;
      document.addEventListener('mousemove', this.handleMouseMove);
      this.isBeingDragged = true;
      this.mousePageOffset = {
        x: e.clientX,
        y: e.clientY
      };
      e.preventDefault();
    },
    dragStop(e: Event) {
      e.preventDefault();
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('touchmove', this.handleTouchMove);
      document.removeEventListener('mouseup', this.dragStop);
      document.removeEventListener('touchend', this.dragStop);
      this.isBeingDragged = false;

      const node = this.$refs?.node as HTMLElement;
      if (node.scrollWidth !== this.nodeData.width || node.scrollHeight !== this.nodeData.height) {
        this.$emit('action', new NodeChange(this.nodeData.id,
          { width: this.nodeData.width, height: this.nodeData.height },
          { width: node.scrollWidth, height: node.scrollHeight }, `resize[${this.nodeData.id}`));
      }
    },
    handleTouchMove(e: TouchEvent) { this.handleMove(e.touches[0].clientX, e.touches[0].clientY); },
    handleMouseMove(e: MouseEvent) { this.handleMove(e.clientX, e.clientY); },
    handleMove(moveX: number, moveY: number) {
      const deltaX = moveX - this.mousePageOffset.x;
      const deltaY = moveY - this.mousePageOffset.y;
      this.mousePageOffset = { x: moveX, y: moveY };
      const x = this.nodeData.x;
      const y = this.nodeData.y;
      this.$emit('action', new NodeChange(this.nodeData.id, { x, y }, { x: x + deltaX, y: y + deltaY },
        `move[${this.nodeData.id}`));
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
