export interface Action {
  type: ActionType;
  mergeKey?: string;
}

export enum ActionType {
  NoOp = 0,
  NodeChange = 1,
  NodeExistanceChange = 2
}

export interface ActionProcessor {
  apply: (a: Action) => void;
  undo: (a: Action) => void;
  mergeAction: (a: Action, b: Action) => Action | undefined
}
