<template>
  <div class="node" @mousedown="dragStart" @dblclick="handleDblClick" :style="nodeStyle">
    <p contenteditable @input="handleInput" ref="textBox" type="text" class="text-box">
      {{ nodeText }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Node',
  props: ['nodeData', 'activateOnMount'],
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
    handleInput(e: any) {
      this.$emit('textChanged', e?.target.innerText);
    },
    dragStart(e: MouseEvent) {
      e.preventDefault();
      this.isBeingDragged = true;
      document.addEventListener('mousemove', this.handleMove);
      document.addEventListener('mouseup', this.dragStop);
      this.mousePageOffset = {
        x: e.clientX,
        y: e.clientY
      }
    },
    dragStop(e: Event) {
      e.preventDefault();
      document.removeEventListener('mousemove', this.handleMove);
      document.removeEventListener('mouseup', this.dragStop);
      this.isBeingDragged = false;
    },
    handleMove(e: Event) {
      const mouseEvent = e as MouseEvent;
      const lastX = this.mousePageOffset.x;
      const lastY = this.mousePageOffset.y;
      this.mousePageOffset = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY
      };
      this.$emit('move', {
        deltaX: this.mousePageOffset.x - lastX,
        deltaY: this.mousePageOffset.y - lastY
      });
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
        top: this.nodeData.y + 'px'
      };
    }
  }
});
</script>

<style scoped>
.node {
  width: 100px;
  border: 1px solid black;
  background: white;
  position: absolute;
  display: flex;
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
