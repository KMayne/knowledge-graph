import { AbstractActionProcessor, Action, ActionProcessor, ActionType } from "./Action";
import { NodeAction, NodeActionType, NodeChange, NodeData } from "./Node";

export class KnowledgeGraphModel extends AbstractActionProcessor {
  nodes: NodeData[];

  constructor(nodes: NodeData[]) {
    super();
    this.nodes = nodes;
    this.saveGraph();
  }

  static loadFromStorage(defaultNodeList: NodeData[]): KnowledgeGraphModel {
    const savedGraph = localStorage.getItem('graph');
    if (savedGraph && savedGraph !== '') {
      try {
        return new KnowledgeGraphModel(JSON.parse(savedGraph));
      }
      catch (e) {
        console.error('Error occured parsing saved graph - backing up graph.');
        localStorage.setItem('graph-backup-' + (new Date()).toISOString(), savedGraph);
      }
    }
    return new KnowledgeGraphModel(defaultNodeList);
  }

  generateId(): string {
    return Math.random().toString(16);
  }

  saveGraph(): void {
    localStorage.setItem('graph', JSON.stringify(this.nodes));
  }

  protected getActionHandler(actionType: ActionType): ActionProcessor | undefined {
    const handler = this.getHandler(actionType);
    if (!handler) {
      console.warn('Unrecognised action type:', JSON.stringify(actionType));
      return;
    }
    return {
      apply: (a) => { handler.apply(a); this.saveGraph(); },
      undo: (a) => { handler.undo(a); this.saveGraph(); },
      mergeActions: (a, b) => handler.mergeActions(a, b)
    }

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
              case NodeActionType.Delete: return this.replaceNode(nodeAction.node.id, () => undefined);
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
    }
  }

  private replaceNode(id: string, replacer: (n: NodeData) => NodeData | undefined): boolean {
    const idx = this.nodes.findIndex(n => n.id === id);
    if (idx === -1) return false;
    const replacement = replacer(this.nodes[idx]);
    this.nodes.splice(idx, 1, ...(replacement ? [replacement] : []))
    return true;
  }
}
