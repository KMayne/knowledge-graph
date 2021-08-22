import { Action, ActionType, ActionProcessor } from './Action'

class HistoryNode {
  parent: HistoryNode | null;
  children: HistoryNode[];
  action: Action

  constructor(parent: HistoryNode | null, children: HistoryNode[], action: Action) {
    this.parent = parent;
    this.children = children;
    this.action = action;
  }
}

export class ActionHistoryTree {
  private currentState: HistoryNode;
  private actionProcessor: ActionProcessor;
  private lastActionTime?: Date;
  private mergeThresholdMs: number;

  constructor(actionProcessor: ActionProcessor, mergeThresholdMs = 1000) {
    this.currentState = new HistoryNode(null, [], { type: ActionType.NoOp });
    this.actionProcessor = actionProcessor;
    this.mergeThresholdMs = mergeThresholdMs;
  }

  applyAction(action: Action): Action | undefined {
    this.actionProcessor.apply(action);
    const currentActionTime = new Date();
    // We're within the merge period and the two actions have the same type and mergeKey
    if (this.lastActionTime && this.currentState
        && (currentActionTime.getTime() - this.lastActionTime.getTime()) < this.mergeThresholdMs) {
      const mergedAction = this.actionProcessor.mergeActions(this.currentState.action, action);
      if (mergedAction) {
        this.lastActionTime = currentActionTime;
        return this.currentState.action = mergedAction;
      }
    }
    this.currentState = new HistoryNode(this.currentState, [], action);
    this.currentState.parent?.children.push(this.currentState);
    this.lastActionTime = currentActionTime;
  }

  undo(): boolean {
    if (this.currentState.parent === null) {
      console.error(`Can't undo root of history tree`);
      return false;
    }
    this.actionProcessor.undo(this.currentState.action);
    this.currentState = this.currentState.parent;
    return true;
  }

  redo(): void {
    const futureBranchCount = this.currentState.children.length;
    if (futureBranchCount < 1) return console.error(`Can't redo with no future branches`);
    this.currentState = this.currentState.children[futureBranchCount - 1];
    this.actionProcessor.apply(this.currentState.action);
  }

  canUndo(): boolean {
    return this.currentState.parent !== null;
  }

  canRedo(): boolean {
    return this.currentState.children.length > 0;
  }
}
