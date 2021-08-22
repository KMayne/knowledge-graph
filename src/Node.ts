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

export class NodeChange implements Action {
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

export enum NodeActionType {
  Create = 0,
  Delete = 1
}
export class NodeAction implements Action {
  type: ActionType = ActionType.NodeExistanceChange;
  subType: NodeActionType
  node: NodeData;

  constructor(node: NodeData, subType: NodeActionType) {
    this.node = node;
    this.subType = subType;
  }
}
