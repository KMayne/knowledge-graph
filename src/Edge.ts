import { Action, ActionType } from "./Action";

export enum EdgeDirection {
  Undirected,
  Directional,
  Bidirectional
}

export interface Edge {
  id: string;
  fromId: string;
  toId: string;
  direction: EdgeDirection;
}

interface EdgeFragment {
  fromId?: string;
  toId?: string;
  direction?: EdgeDirection;
}

export enum EdgeActionType {
  Create = 0,
  Delete = 1
}
export class EdgeAction implements Action {
  type: ActionType = ActionType.EdgeExistanceChange;
  subType: EdgeActionType
  edge: Edge;

  constructor(edge: Edge, subType: EdgeActionType) {
    this.edge = edge;
    this.subType = subType;
  }
}

export class EdgeChange implements Action {
  edgeId: string;
  before: EdgeFragment;
  after: EdgeFragment;
  type: ActionType;
  mergeKey: string;
  constructor(edgeId: string, before: EdgeFragment, after: EdgeFragment, mergeKey: string) {
    this.edgeId = edgeId;
    this.before = before;
    this.after = after;
    this.mergeKey = mergeKey;
    this.type = ActionType.EdgeChange;
  }
}
