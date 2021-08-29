export interface Action {
  type: ActionType;
  mergeKey?: string;
}

export enum ActionType {
  NoOp = 0,
  NodeChange = 1,
  NodeExistanceChange = 2,
  EdgeExistanceChange = 4
}

export interface ActionProcessor {
  apply: (a: Action) => void;
  undo: (a: Action) => void;
  mergeActions: (a: Action, b: Action) => Action | undefined
}

export abstract class AbstractActionProcessor implements ActionProcessor {
  apply(action: Action): void {
    this.getActionHandler(action.type)?.apply(action);
  }

  undo(action: Action): void {
    this.getActionHandler(action.type)?.undo(action);
  }

  mergeActions(a: Action, b: Action): Action | undefined {
    if (a.type !== b.type || a.mergeKey != b.mergeKey) return;
    return this.getActionHandler(a.type)?.mergeActions(a, b);
  }

  protected abstract getActionHandler(actionType: ActionType): ActionProcessor | undefined;
}
