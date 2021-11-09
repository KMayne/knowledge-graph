<template>
  <section ref="graphArea" class="graph-area" :style="graphAreaStyle"
    @touchstart.stop="handleTouchStart"
    @mousedown="handleMouseDown"
    @dblclick="makeNewNode"
    @blur="handleBackgroundDragStop"
    @wheel="handleMouseWheel">
    <svg class="edges">
      <Edge v-for="edge in edgesWithPositions"
      :key="edge.fromId + edge.toId"
      :edge="edge" @action="a => $emit('action', a)"
      :offsetX="offsetX" :offsetY="offsetY" :scale="scale"
      :selected="selectedEdge === edge.id"
      @focus="selectedEdge = edge.id"  />
      <Edge v-if="liveEdge" :edge="liveEdge" :noHover="true"
        :offsetX="offsetX" :offsetY="offsetY" :scale="scale" />
    </svg>
    <Node v-for="node in graph.nodes"
      :key="node.id" :node-data="node"
      :offsetX="offsetX" :offsetY="offsetY" :scale="scale"
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
import { getRectCentre, getClippedCentreJoiningLine, NodeAction, NodeActionType, NodeData, Coords } from '@/Node';
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
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      lastTouches: null as TouchList | null,
      lastMousePos: null as Coords | null,
      moveVelocity: null as Coords | null,
      currentAnimation: null as number | null,
      mousePos: { x: 0, y: 0 }
    }
  },
  methods: {
    // There's like 3 different ways scaling and offsets are dealt with and it's gross
    // but it works and features take priority
    canvasToScreenCoords(c: Coords): Coords {
      const boundingRect = (this?.$refs?.graphArea as HTMLElement)?.getBoundingClientRect()
        || { width: 0, height: 0 };
      return {
        x: (c.x + this.offsetX) * this.scale - (boundingRect.width / 2 * (this.scale - 1)),
        y: (c.y + this.offsetY) * this.scale - (boundingRect.height / 2 * (this.scale - 1))
      }
    },
    screenToCanvasCoords(c: Coords): Coords {
      const boundingRect = (this?.$refs?.graphArea as HTMLElement).getBoundingClientRect();
      return {
        x: (c.x + (boundingRect.width / 2 * (this.scale - 1))) / this.scale - this.offsetX,
        y: (c.y + (boundingRect.height / 2 * (this.scale - 1))) / this.scale - this.offsetY
      };
    },
    getMouseCanvasCoords(e: MouseEvent) {
      const boundingRect = (this?.$refs?.graphArea as HTMLElement).getBoundingClientRect();
      return this.screenToCanvasCoords({ x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y });
    },
    makeNewNode(e: MouseEvent) {
      const { x, y } = this.getMouseCanvasCoords(e);
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
      this.selectedEdge = null;
      this.liveEdge = {
        id: this.graph.generateId(),
        direction: EdgeDirection.Directional,
        fromId: id, toId: '',
        fromX: x, fromY: y,
        toX: x, toY: y
      };
      document.addEventListener('mousemove', this.handleLiveEdgeMouseMove);
      document.addEventListener('mouseup', this.handleEdgeMouseUp)
    },
    handleLiveEdgeMouseMove(e: MouseEvent) {
      if (!this.liveEdge) return;
      const { x, y } = this.getMouseCanvasCoords(e);
      this.liveEdge.toX = x
      this.liveEdge.toY = y;
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
          direction: this.liveEdge.direction
        }, EdgeActionType.Create))
      }
      this.liveEdge = null;
    },
    handleMouseDown(e: MouseEvent) {
      if (this.currentAnimation) clearTimeout(this.currentAnimation);
      this.selectedNodeId = null;
      this.selectedEdge = null;
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      document.addEventListener('mousemove', this.handleBackgroundDrag);
      document.addEventListener('mouseup', this.handleBackgroundDragStop);
    },
    handleTouchStart(e: TouchEvent) {
      if (this.currentAnimation) clearTimeout(this.currentAnimation);
      this.selectedNodeId = null;
      this.selectedEdge = null;
      if (e.touches.length > 1) {
        if (e.touches.length > 2) return false;
        // TODO: Add pinch zoom
        // document.addEventListener('touchmove', )
        return;
      }
      this.lastTouches = e.touches;
      document.addEventListener('touchmove', this.handleBackgroundTouchDrag);
      document.addEventListener('touchend', this.handleBackgroundDragStop);
      document.addEventListener('touchcancel', this.handleBackgroundDragStop);
    },
    handleBackgroundDrag(e: MouseEvent) {
      if (!this?.lastMousePos) {
        this.handleBackgroundDragStop();
        throw new Error('Bad mouse state');
      }
      const vx = e.clientX - this.lastMousePos.x;
      const vy = e.clientY - this.lastMousePos.y;
      this.offsetX += vx / this.scale;
      this.offsetY += vy / this.scale;
      this.moveVelocity = { x: vx, y: vy };
      this.lastMousePos = { x: e.clientX, y: e.clientY };
    },
    handleBackgroundTouchDrag(e: TouchEvent) {
      if (!this?.lastTouches) {
        this.handleBackgroundDragStop();
        throw new Error('Bad touch state');
      }
      if (e.touches.length > 1) this.handleBackgroundDragStop();
      const currentTouch = e.touches[0];
      const vx = currentTouch.clientX - this.lastTouches[0].clientX;
      const vy = currentTouch.clientY - this.lastTouches[0].clientY;
      this.offsetX += vx / this.scale;
      this.offsetY += vy / this.scale;
      this.moveVelocity = { x: vx, y: vy };
      this.lastTouches = e.touches;
    },
    animateBackgroundPosition(vx: number, vy: number) {
      if (this.currentAnimation) clearTimeout(this.currentAnimation);
      if (vx === 0 && vy === 0) return;
      const FRAME_RATE = 60; // FPS
      const DURATION = 1.5;
      const SPEED_FACTOR = 4;
      const startingOffset = { x: this.offsetX, y: this.offsetY };
      const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);
      const runAnimation = (iterations: number) => {
        if (iterations <= 0) return this.currentAnimation = null;
        const progress = easeOutQuart(1 - iterations / (DURATION * FRAME_RATE));
        this.offsetX = startingOffset.x + vx * progress * SPEED_FACTOR;
        this.offsetY = startingOffset.y + vy * progress * SPEED_FACTOR;
        this.currentAnimation = setTimeout(runAnimation, 1 / FRAME_RATE, iterations - 1)
      }
      runAnimation(DURATION * FRAME_RATE);
    },
    handleBackgroundDragStop() {
      document.removeEventListener('mousemove', this.handleBackgroundDrag);
      document.removeEventListener('touchmove', this.handleBackgroundTouchDrag);
      document.removeEventListener('mouseup', this.handleBackgroundDragStop);
      if (this.moveVelocity) {
        this.animateBackgroundPosition(this.moveVelocity.x, this.moveVelocity.y);
      }
      this.lastTouches = null;
      this.moveVelocity = null;
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
    },
    handleMouseWheel(e: WheelEvent) {
      this.scale = Math.max(0.5, Math.min(2, this.scale + e.deltaY * 0.001));
    }
  },
  mounted() {
    document.addEventListener('wheel', this.handleMouseWheel);
  },
  computed: {
    edgesWithPositions(): PositionedEdge[] {
     return this.graph.edges.map((edge: Edge) => {
        const fromNode = this.graph.getNode(edge.fromId);
        const toNode = this.graph.getNode(edge.toId);
        const { fromX, fromY, toX, toY} = getClippedCentreJoiningLine(fromNode, toNode);
        return {
          ...edge,
          fromX: fromX,
          fromY: fromY,
          toX: toX,
          toY: toY
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
    graphAreaStyle() {
      return {
        backgroundImage: `radial-gradient(#616161 ${1 + 0.5 * this.scale}px, transparent 0)`,
        backgroundSize: `${36 * this.scale}px ${36 * this.scale}px`,
        backgroundPosition:  `calc(${this.offsetX * this.scale}px + calc(100vw * ${0.5 - this.scale})) `
          + `calc(${this.offsetY * this.scale}px + calc(100vh * ${0.5 - this.scale})`,
      };
    }
  }
});
</script>

<style scoped>
.graph-area {
  width: 100%;
  height: 100%;
  background: white;
  position: relative;
}

.edges {
  width: 100%;
  height: 100%;
}
</style>
