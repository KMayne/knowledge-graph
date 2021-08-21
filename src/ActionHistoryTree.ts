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
HistoryNode.RootAction = new HistoryNode(null, [], { type: ActionType.NoOp })

export class ActionHistoryTree {
  currentState: HistoryNode;
  actionProcessor: ActionProcessor;
  lastActionTime?: Date;
  mergeThresholdMs: number;

  constructor(actionProcessor: ActionProcessor, mergeThresholdMs = 1000) {
    this.currentState = HistoryNode.RootAction;
    this.actionProcessor = actionProcessor;
    this.mergeThresholdMs = mergeThresholdMs;
  }

  applyAction(action: Action) {
    this.actionProcessor.apply(action);
    const currentActionTime = new Date();
    // We're within the merge period and the two actions have the same type and mergeKey
    if (this.lastActionTime && this.currentState
        && (currentActionTime.getTime() - this.lastActionTime.getTime()) < this.mergeThresholdMs) {
        const mergedAction = this.actionProcessor.mergeAction(this.currentState.action, action);
        if (mergedAction) {
          this.lastActionTime = currentActionTime;
          return this.currentState.action = mergedAction;
        } else {
          console.warn(`didn't merge`);
        }
    } else {
      console.warn('merge time expired')
    }
    this.currentState = new HistoryNode(this.currentState, [], action);
    this.lastActionTime = currentActionTime;
  }

  undo() {
    if (!this.currentState) return console.error(`Can't undo with empty history`);
    if (!this.currentState.parent) return console.error(`Can't undo root of history tree`);
    this.actionProcessor.undo(this.currentState.action);
    this.currentState = this.currentState.parent;
  }

  redo() {
    if (!this.currentState) return console.error(`Can't undo with empty history`);
    const futureBranchCount = this.currentState.children.length;
    if (futureBranchCount < 1) return console.error(`Can't redo with no future branches`);
    this.currentState = this.currentState.children[futureBranchCount - 1];
    this.actionProcessor.apply(this.currentState.action);
  }
}
