import { Action, ActionType } from "./Action";

export interface Edge {
  edgeId: string;
  fromId: string;
  toId: string;
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
