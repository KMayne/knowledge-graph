<template>
  <section ref="graphArea" class="graph-area" :style="{ backgroundPosition }"
    @touchstart.stop="handleTouchStart"
    @mousedown="handleMouseDown"
    @dblclick="makeNewNode"
    @blur="handleBackgroundDragStop">
    <svg class="edges">
      <Edge v-for="edge in edgesWithPositions"
      :key="edge.fromId + edge.toId"
      :edge="edge" @action="a => $emit('action', a)"
      :selected="selectedEdge === edge.id"
      @focus="selectedEdge = edge.id"/>
      <Edge v-if="liveEdge" :edge="liveEdge" :noHover="true" />
    </svg>
    <Node v-for="node in graph.nodes"
      :key="node.id" :node-data="node"
      :offsetX="offsetX" :offsetY="offsetY"
      :activateOnMount="nodeToFocus === node.id"
      :selected="selectedNodeId === node.id"
      @mounted="() => handleNodeMount(node.id)"
      @startEdge="_ => handleStartEdge(node.id)"
      @hover="_ => handleNodeHover(node.id)"
      @openGraph="$emit('openGraph', node.id)"
      @action="a => $emit('action', a)"
      @focus="updateSelectedNode(node.id)"
    ></Node>
    <property-panel v-if="selectedObject" :target="selectedObject" :targetType="selectedObjectType"
      :graph="graph" @action="a => $emit('action', a)">
    </property-panel>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import NodeComponent from './Node.vue';
import EdgeComponent from './Edge.vue';
import PropertyPanel from './PropertyPanel.vue';
import { getRectCentre, getClippedCentreJoiningLine, NodeAction, NodeActionType, NodeData } from '@/Node';
import { Edge, EdgeAction, EdgeActionType, EdgeDirection } from '@/Edge';

type PositionedEdge = ({
  fromX: number,
  fromY: number,
  toX?: number,
  toY?: number
} & Edge);

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 60;
export default Vue.extend({
  name: 'Graph',
  components: {
    Node: NodeComponent,
    Edge: EdgeComponent,
    PropertyPanel
  },
  props: ['graph'],
  data: () => {
    return {
      nodeToFocus: null,
      liveEdge: null as PositionedEdge | null,
      selectedEdge: null as string | null,
      selectedNodeId: null as string | null,
      offsetX: 0,
      offsetY: 0,
      lastTouch: null as Touch | null
    }
  },
  methods: {
    makeNewNode(e: MouseEvent) {
      const [x, y] = [e.offsetX, e.offsetY]
      const newId = this.graph.generateId();
      this.$emit('action', new NodeAction({
        id: newId,
        text: '',
        // We want node to be centered at coords
        x: x - DEFAULT_WIDTH / 2,
        y: y - DEFAULT_HEIGHT / 2,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
      }, NodeActionType.Create));
      this.nodeToFocus = newId;
    },
    handleNodeMount(id: string) {
      if (this.nodeToFocus === id) this.nodeToFocus = null;
    },
    handleStartEdge(id: string) {
      const { x, y } = getRectCentre(this.graph.getNode(id));
      const [nodeCenterX, nodeCenterY] = [x + this.offsetX, y + this.offsetY]
      this.selectedEdge = null;
      this.liveEdge = {
        id: this.graph.generateId(),
        direction: EdgeDirection.Undirected,
        fromId: id, toId: '',
        fromX: nodeCenterX, fromY: nodeCenterY,
        toX: nodeCenterX, toY: nodeCenterY
      };
      document.addEventListener('mousemove', this.handleLiveEdgeMouseMove);
      document.addEventListener('mouseup', this.handleEdgeMouseUp)
    },
    handleLiveEdgeMouseMove(e: MouseEvent) {
      if (!this.liveEdge) return;
      const boundingRect = (this?.$refs?.graphArea as HTMLElement).getBoundingClientRect();
      this.liveEdge.toX = e.clientX - boundingRect.x;
      this.liveEdge.toY = e.clientY - boundingRect.y;
    },
    handleEdgeMouseUp(e: MouseEvent) {
      document.removeEventListener('mousemove', this.handleLiveEdgeMouseMove);
      document.removeEventListener('mouseup', this.handleEdgeMouseUp);
      if (this.liveEdge && this.liveEdge.toId !== ''
        && this.elementWithinNode(e.target as HTMLElement)
        && !this.graph.hasEdge(this.liveEdge.fromId, this.liveEdge.toId)) {
        this.$emit('action', new EdgeAction({
          id: this.liveEdge.id,
          fromId: this.liveEdge.fromId,
          toId: this.liveEdge.toId,
          direction: EdgeDirection.Undirected
        }, EdgeActionType.Create))
      }
      this.liveEdge = null;
    },
    handleMouseDown() {
      this.selectedNodeId = null;
      this.selectedEdge = null;
      document.addEventListener('mousemove', this.handleBackgroundDrag);
      document.addEventListener('mouseup', this.handleBackgroundDragStop);
    },
    handleTouchStart(e: TouchEvent) {
      e.preventDefault();
      this.selectedNodeId = null;
      this.selectedEdge = null;
      if (e.touches.length > 1) return false;
      this.lastTouch = e.touches[0];
      document.addEventListener('touchmove', this.handleBackgroundTouchDrag);
      document.addEventListener('touchend', this.handleBackgroundDragStop);
      document.addEventListener('touchcancel', this.handleBackgroundDragStop);
    },
    handleBackgroundDrag(e: MouseEvent) {
      this.offsetX += e.movementX;
      this.offsetY += e.movementY;
    },
    handleBackgroundTouchDrag(e: TouchEvent) {
      if (e.touches.length > 1) this.handleBackgroundDragStop();
      const currentTouch = e.touches[0];
      this.offsetX += this.lastTouch?.clientX ? (currentTouch.clientX - this.lastTouch?.clientX) : 0;
      this.offsetY += this.lastTouch?.clientY ? (currentTouch.clientY - this.lastTouch?.clientY) : 0;
      this.lastTouch = currentTouch;
    },
    handleBackgroundDragStop() {
        document.removeEventListener('mousemove', this.handleBackgroundDrag);
        document.removeEventListener('touchmove', this.handleBackgroundTouchDrag);
        document.removeEventListener('mouseup', this.handleBackgroundDragStop);
        this.lastTouch = null;
    },
    elementWithinNode(element: HTMLElement | null): boolean {
      if (element === null) return false;
      return element.classList.contains('node') || this.elementWithinNode(element.parentElement);
    },
    handleNodeHover(id: string) {
      if (this.liveEdge) {
        this.liveEdge.toId = id;
        const { x: toX, y: toY } = getRectCentre(this.graph.getNode(id));
        this.liveEdge.toX = toX;
        this.liveEdge.toY = toY;
      }
    },
    updateSelectedNode(id: string | null) {
      this.selectedNodeId = id;
      this.selectedEdge = null;
    }
  },
  computed: {
    edgesWithPositions(): PositionedEdge[] {
     return this.graph.edges.map((edge: Edge) => {
        const fromNode = this.graph.getNode(edge.fromId);
        const toNode = this.graph.getNode(edge.toId);
        const { fromX, fromY, toX, toY} = getClippedCentreJoiningLine(fromNode, toNode);
        return {
          ...edge,
          fromX: fromX + this.offsetX,
          fromY: fromY + this.offsetY,
          toX: toX + this.offsetX,
          toY: toY + this.offsetY
        };
     });
    },
    selectedObject(): NodeData | Edge {
      return this.selectedNodeId
        ? this.graph.getNode(this.selectedNodeId)
        : this.selectedEdge && this.graph.getEdge(this.selectedEdge);
    },
    selectedObjectType(): string {
      return this.selectedNodeId ? 'node'
             : this.selectedEdge ? 'edge'
             : '';
    },
    backgroundPosition(): string {
      return `${this.offsetX}px ${this.offsetY}px`;
    }
  }
});
</script>

<style scoped>
.graph-area {
  width: 100%;
  height: 100%;
  background: white;
  background-image: radial-gradient(#616161 1px, transparent 0);
  background-size: 36px 36px;
  position: relative;
}

.edges {
  width: 100%;
  height: 100%;
}
</style>
