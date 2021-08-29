<template>
  <section ref="graphArea" class="graph-area"
    @dblclick="e => makeNewNode(e.clientX, e.clientY)"
    @mousedown="selectedNode = undefined">
    <svg class="edges">
      <Edge v-for="edge in edgesWithPositions"
      :key="edge.fromId + edge.toId"
      :edge="edge" @action="a => $emit('action', a)" />
      <Edge v-if="liveEdge" :edge="liveEdge" :noHover="true" />
    </svg>
    <Node v-for="node in graph.nodes"
      :key="node.id" :node-data="node"
      :activateOnMount="nodeToFocus === node.id"
      @mounted="() => handleNodeMount(node.id)"
      @startEdge="_ => handleStartEdge(node.id)"
      @hover="_ => handleNodeHover(node.id)"
      @openGraph="$emit('openGraph', node.id)"
      @action="a => $emit('action', a)"
    ></Node>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import NodeComponent from './Node.vue';
import EdgeComponent from './Edge.vue';
import { getNodeCentre, NodeAction, NodeActionType } from '@/Node';
import { Edge, EdgeAction, EdgeActionType } from '@/Edge';

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
    Edge: EdgeComponent
  },
  props: ['graph'],
  data: () => {
    return {
      nodeToFocus: null,
      liveEdge: null as PositionedEdge | null,
      selectedEdge: null as string | null
    }
  },
  methods: {
    makeNewNode(x: number, y: number) {
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
      const { x: fromX, y: fromY } = getNodeCentre(this.graph.getNode(id));
      this.selectedEdge = null;
      this.liveEdge = {
        id: this.graph.generateId(),
        fromId: id, toId: '',
        fromX, fromY,
        toX: fromX, toY: fromY
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
        }, EdgeActionType.Create))
      }
      this.liveEdge = null;
    },
    elementWithinNode(element: HTMLElement | null): boolean {
      if (element === null) return false;
      return element.classList.contains('node') || this.elementWithinNode(element.parentElement);
    },
    handleNodeHover(id: string) {
      if (this.liveEdge) {
        this.liveEdge.toId = id;
        const { x: toX, y: toY } = getNodeCentre(this.graph.getNode(id));
        this.liveEdge.toX = toX;
        this.liveEdge.toY = toY;
      }
    }
  },
  computed: {
    edgesWithPositions(): PositionedEdge[] {
     return this.graph.edges.map((edge: Edge) => {
        const fromNode = this.graph.getNode(edge.fromId);
        const toNode = this.graph.getNode(edge.toId);
        const { x: fromX, y: fromY } = getNodeCentre(fromNode);
        const { x: toX, y: toY } = getNodeCentre(toNode);
        return { ...edge, fromX, fromY, toX, toY };
     });
    }
  }
});
</script>

<style scoped>
.graph-area {
  width: 100%;
  height: 100%;
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, #E7E7E7 1px, transparent 1px),
    linear-gradient(to bottom, #E7E7E7 1px, transparent 1px);
  position: relative;
}

.edges {
  width: 100%;
  height: 100%;
}
</style>
