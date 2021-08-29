<template>
  <div ref="node" class="node" :style="nodeStyle" tabindex="0"
    @keydown="handleKeyDown"
    @dblclick.stop
    @mousedown.stop="handleMouseDown"
    @touchstart.stop="handleTouchStart"
    @blur="handleDivBlur"
    @mouseover="$emit('hover')">
    <p :contenteditable="editMode"
      ref="textBox" type="text" class="text-box"
      @input="handleInput" @blur="editMode = false;">
      {{ nodeText }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { NodeAction, NodeActionType, NodeChange } from '../Node';

export default Vue.extend({
  name: 'Node',
  props: ['nodeData', 'activateOnMount'],
  data: () => ({
    editMode: false,
    hasMoved: false,
    isBeingDragged: false,
    mousePageOffset: {
      x: 0,
      y: 0
    },
    nodeText: ''
  }),
  mounted() {
    this.nodeText = this.nodeData.text;
    if (this.activateOnMount) { this.startEdit(); }
    this.$emit('mounted');
  },
  methods: {
    handleInput(e: InputEvent) {
      this.$emit('action', new NodeChange(this.nodeData.id, { text: this.nodeData.text },
        { text: (e?.target as HTMLElement).innerText }, `text-change[${this.nodeData.id}`));
    },
    handleTouchStart(e: TouchEvent) {
      // If we're not dragging the textbox, then we must be using the resize handle
      // so allow the default operation
      if ((e?.target as HTMLElement).tagName !== 'P') return true;

      this.dragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      document.addEventListener('touchmove', this.handleTouchMove);
      document.addEventListener('touchend', this.dragStop);
      document.addEventListener('touchcancel', this.dragStop);
      if (!this.editMode) e.preventDefault();
    },
    handleMouseDown(e: MouseEvent) {
      if (e.altKey) {
        this.$emit('startEdge');
        return;
      }
      // If we clicked through to the div, we're dragging the resize handle
      if ((e?.target as HTMLElement).tagName === 'DIV') return;

      this.dragStart({ x: e.clientX, y: e.clientY })
      document.addEventListener('mouseup', this.dragStop);
      document.addEventListener('mousemove', this.handleMouseMove);
    },
    dragStart(initialPosition: { x: number, y: number }) {
      this.focus();
      this.isBeingDragged = true;
      this.hasMoved = false;
      this.mousePageOffset = initialPosition;
    },
    dragStop(e: Event) {
      e.stopPropagation();
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
      } else if (!this.hasMoved) {
        // Just a normal click/tap
        this.editMode = true;
      }
    },
    handleTouchMove(e: TouchEvent) { this.handleMove(e.touches[0].clientX, e.touches[0].clientY); },
    handleMouseMove(e: MouseEvent) { this.handleMove(e.clientX, e.clientY); },
    handleMove(moveX: number, moveY: number) {
      this.hasMoved = true;
      this.focus();
      const deltaX = moveX - this.mousePageOffset.x;
      const deltaY = moveY - this.mousePageOffset.y;
      this.mousePageOffset = { x: moveX, y: moveY };
      const x = this.nodeData.x;
      const y = this.nodeData.y;
      this.$emit('action', new NodeChange(this.nodeData.id, { x, y }, { x: x + deltaX, y: y + deltaY },
        `move[${this.nodeData.id}`));
    },
    handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Delete') {
        this.$emit('action', new NodeAction(this.nodeData, NodeActionType.Delete));
      } else if (e.code === 'Enter') {
        this.startEdit();
        e.preventDefault();
      } else if (e.code === 'Escape') {
        this.editMode = false;
        this.focus();
      }
    },
    handleDivBlur(e: FocusEvent) {
      if (e.relatedTarget !== this.$refs.textBox) {
        this.editMode = false;
      }
    },
    focus() {
      (this?.$refs.node as HTMLElement).focus();
    },
    startEdit() {
      this.editMode = true;
      const textBox = (this.$refs?.textBox as HTMLElement);
      textBox.contentEditable = 'true';
      textBox.focus();
      const range = document.createRange();
      range.selectNodeContents(textBox);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  },
  computed: {
    nodeStyle() {
      return {
        left: this.nodeData.x + 'px',
        top: this.nodeData.y + 'px',
        width: this.nodeData.width + 'px',
        height: this.nodeData.height + 'px',
      };
    }
  }
});
</script>

<style scoped>
.node {
  outline: 1px solid black;
  background: white;
  position: absolute;
  resize: both;
  overflow: hidden;
  z-index: 100;
}

.node:focus-visible, .node:focus-within {
  outline: 3px solid rgb(117, 167, 248);
}

.node:hover:not(:focus) {
  outline: 3px solid rgb(182, 207, 255);
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
  outline: 0px solid transparent;
  user-select: none;
}
</style>
