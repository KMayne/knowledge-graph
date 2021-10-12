<template>
  <section ref="graphArea" class="graph-area"
    @mousedown="selectedNodeId = null; selectedEdge = null"
    @dblclick="makeNewNode">
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
      selectedNodeId: null as string | null
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
      const { x: fromX, y: fromY } = getRectCentre(this.graph.getNode(id));
      this.selectedEdge = null;
      this.liveEdge = {
        id: this.graph.generateId(),
        direction: EdgeDirection.Undirected,
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
          direction: EdgeDirection.Undirected
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
        const edgeCoords = getClippedCentreJoiningLine(fromNode, toNode);
        return { ...edge, ...edgeCoords };
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
