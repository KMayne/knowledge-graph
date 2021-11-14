import { AbstractActionProcessor, Action, ActionProcessor, ActionType } from "./Action";
import { Edge, EdgeAction, EdgeChange, EdgeActionType } from './Edge';
import { NodeAction, NodeActionType, NodeChange, NodeData, NodeType } from "./Node";

export interface Graph {
  name: string;
  nodes: NodeData[];
  edges: Edge[];
}

export class KnowledgeGraphModel extends AbstractActionProcessor implements Graph {
  id: string;
  name: string;
  nodes: NodeData[];
  edges: Edge[];

  constructor(name: string, nodes: NodeData[] = [], edges: Edge[] = []) {
    super();
    this.id = this.generateId();
    this.name = name;
    this.nodes = nodes;
    this.edges = edges;
  }

  static loadFromStorage(defaultNodeList: NodeData[]): KnowledgeGraphModel {
    const savedGraph = localStorage.getItem('graph');
    if (savedGraph && savedGraph !== '') {
      try {
        const parsedGraph = JSON.parse(savedGraph);
        return new KnowledgeGraphModel(parsedGraph.name, parsedGraph.nodes, parsedGraph.edges);
      }
      catch (e) {
        console.error('Error occured parsing saved graph - backing up graph.');
        localStorage.setItem('graph-backup-' + (new Date()).toISOString(), savedGraph);
      }
    }
    return new KnowledgeGraphModel('🌲', defaultNodeList);
  }

  getNode(id: string): NodeData {
    return this.nodes[this.getNodeIndex(id)];
  }

  getEdge(id: string): Edge | undefined {
    return this.edges.find(e => e.id === id);
  }

  generateId(): string {
    return Math.random().toString(16);
  }

  hasEdge(fromId: string, toId: string): boolean {
    return this.edges.some(e => e.fromId === fromId && e.toId === toId);
  }

  serialise(): string {
    return JSON.stringify({ name: this.name, nodes: this.nodes, edges: this.edges });
  }

  protected getActionHandler(actionType: ActionType): ActionProcessor | undefined {
    const handler = this.getHandler(actionType);
    if (!handler) {
      console.warn('Unrecognised action type:', JSON.stringify(actionType));
      return;
    }
    return {
      apply: (a) => {
        handler.apply(a);
        this.sortNodes();
      },
      undo: (a) => {
        handler.undo(a);
        this.sortNodes();
      },
      mergeActions: (a, b) => handler.mergeActions(a, b)
    }
  }

  private sortNodes(): void {
    // Sort in reading order
    this.nodes.sort((a: NodeData, b: NodeData) => a.y == b.y ? a.x - b.x : a.y - b.y);
  }

  private getHandler(actionType: ActionType) {
  switch (actionType) {
    case ActionType.NoOp: return { apply() {}, undo() {}, mergeActions: () => undefined } as ActionProcessor;

    case ActionType.NodeChange:
      return {
        apply: (action: Action) => {
          const nodeChange = action as NodeChange;
          this.replaceNode(nodeChange.nodeId, node => ({ ...node, ...nodeChange.after }));
        },
        undo: (action: Action) => {
          const nodeChange = action as NodeChange;
          this.replaceNode(nodeChange.nodeId, node => ({ ...node, ...nodeChange.before }));
        },
        mergeActions: (a: Action, b: Action) => {
          if ((a as NodeChange).nodeId !== (b as NodeChange).nodeId) return;
          return { ...(b as NodeChange), before: (a as NodeChange).before } as NodeChange;
        }
      }

    case ActionType.NodeExistanceChange:
      return {
        apply: (action: Action) => {
          const nodeAction = action as NodeAction;
          switch (nodeAction.subType) {
            case NodeActionType.Create: return this.nodes.push(nodeAction.node);
            case NodeActionType.Delete:
              // Cannot delete built-in nodes
              if (nodeAction.node.type === NodeType.BuiltIn) return;
              return this.replaceNode(nodeAction.node.id, () => undefined);
          }
        },
        undo: (action: Action) => {
          const nodeAction = action as NodeAction;
          switch (nodeAction.subType) {
            case NodeActionType.Create: return this.replaceNode(nodeAction.node.id, () => undefined);
            case NodeActionType.Delete: return this.nodes.push(nodeAction.node);
          }
        },
        mergeActions: () => undefined
      }

    case ActionType.EdgeChange:
      return {
        apply: (action: Action) => {
          const edgeChange = action as EdgeChange;
          this.replaceEdge(edgeChange.edgeId, node => ({ ...node, ...edgeChange.after }));
        },
        undo: (action: Action) => {
          const edgeChange = action as EdgeChange;
          this.replaceEdge(edgeChange.edgeId, node => ({ ...node, ...edgeChange.before }));
        },
        mergeActions: (a: Action, b: Action) => {
          if ((a as EdgeChange).edgeId !== (b as EdgeChange).edgeId) return;
          return { ...(b as EdgeChange), before: (a as EdgeChange).before } as EdgeChange;
        }
      }

    case ActionType.EdgeExistanceChange:
      return {
        apply: (action: Action) => {
          const edgeAction = action as EdgeAction;
          switch (edgeAction.subType) {
            case EdgeActionType.Create: return this.edges.push(edgeAction.edge);
            case EdgeActionType.Delete: return this.replaceEdge(edgeAction.edge.id, () => undefined);
          }
        },
        undo: (action: Action) => {
          const edgeAction = action as EdgeAction;
          switch (edgeAction.subType) {
            case EdgeActionType.Create: return this.replaceEdge(edgeAction.edge.id, () => undefined);
            case EdgeActionType.Delete: return this.edges.push(edgeAction.edge);
          }
        },
        mergeActions: () => undefined
      }
    }
  }

  private replaceNode(id: string, replacer: (n: NodeData) => NodeData | undefined): boolean {
    const idx = this.getNodeIndex(id);
    if (idx === -1) {
      console.warn('Node replacement target not found');
      return false;
    }
    const replacement = replacer(this.nodes[idx]);
    this.nodes.splice(idx, 1, ...(replacement ? [replacement] : []))
    return true;
  }

  private replaceEdge(id: string, replacer: (n: Edge) => Edge | undefined): boolean {
    const idx = this.edges.findIndex(e => e.id === id);
    if (idx === -1) {
      console.warn('Edge replacement target not found');
      return false;
    }
    const replacement = replacer(this.edges[idx]);
    this.edges.splice(idx, 1, ...(replacement ? [replacement] : []))
    return true;
  }

  private getNodeIndex(id: string) {
    return this.nodes.findIndex(n => n.id === id);
  }
}
