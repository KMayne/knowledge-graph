import { Action, ActionType } from './Action'

export interface NodeData {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodeFragement {
  text?: string,
  x?: number,
  y?: number
  width?: number,
  height?: number,
}

export class NodeDelta implements Action {
  nodeId: string;
  before: NodeFragement;
  after?: NodeFragement;
  type: ActionType;
  mergeKey: string;
  constructor(nodeId: string, before: NodeFragement, after: NodeFragement, mergeKey: string) {
    this.nodeId = nodeId;
    this.before = before;
    this.after = after;
    this.mergeKey = mergeKey;
    this.type = ActionType.NodeChange;
  }
}
