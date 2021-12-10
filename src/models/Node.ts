import { Action, ActionType } from './Action'
import { KnowledgeGraphModel } from '../KnowledgeGraphModel';
import { DataStore } from './schema-graph';
import { v4 as uuidV4 } from 'uuid';

export interface Coords {
  x: number,
  y: number
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum NodeType {
  Normal,
  Folder,
  BuiltIn
}

export const UserNodeTypes = [
  NodeType.Normal,
  NodeType.Folder
];

type NodeSubType = BuiltIn;
enum BuiltIn {
  Integrations
}

export const DEFAULT_WIDTH = 150;
export const DEFAULT_HEIGHT = 60;
export interface NodeMetadata {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  graph?: KnowledgeGraphModel
  type: NodeType;
  subType?: NodeSubType;
  data: { [schemaId: string]: DataStore };
}

export interface NodeFragement {
  name?: string,
  x?: number,
  y?: number
  width?: number,
  height?: number,
  type?: NodeType,
  subType?: NodeSubType
  data?: { [schemaId: string]: DataStore }
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
  node: NodeMetadata;

  constructor(node: NodeMetadata, subType: NodeActionType) {
    this.node = node;
    this.subType = subType;
  }
}

export function generateNodeId(): string {
  return `n-${uuidV4()}`;
}

export function getRectCentre(rect: Rect): Coords {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function subtractCoords(a: Coords, b: Coords): number[] {
  return subtractVectors([a.x, a.y], [b.x, b.y]);
}

function subtractVectors(a: number[], b: number[]): number[] {
  if (a.length !== b.length) throw new Error('Cannot subtract vectors of different sizes');
  return a.map((_, i) => (a[i] - b[i]));
}
function negateVector(v: number[]) {
  return v.map(x => -x);
}

export function getClippedCentreJoiningLine(a: Rect, b: Rect): { fromX: number, fromY: number, toX: number, toY: number } {
  const aCentre = getRectCentre(a);
  const bCentre = getRectCentre(b);

  const centreVec = subtractCoords(bCentre, aCentre);
  const [fromX, fromY] = findRectVectorIntersection(a, centreVec);
  const [toX, toY] = findRectVectorIntersection(b, negateVector(centreVec));
  return { fromX, fromY, toX, toY }
}

function findRectVectorIntersection(r: Rect, v: number[]) {
  const rectCentre = getRectCentre(r);
  const centreJoiningGradient = v[1] / v[0];
  if (Math.abs(centreJoiningGradient) > (r.height / r.width)) {
    // Know that vector is steeper than rectangle diagonal so will intersect with top or bottom edge
    // To figure out if it's top or bottom, is vertical vector component increasing or decreasing?
    const intersectY = r.y + (v[1] > 0 ? r.height : 0)
    // If it's a horizontal line, we use the same xv
    const intersectX = v[1] === 0 ? rectCentre.x : rectCentre.x + v[0] * (intersectY - rectCentre.y) / v[1];
    return [intersectX, intersectY]
  } else {
    // Know that vector is less steep than rectangle diagonal so will intersect with left or right edge
    // To figure out if it's left or right, is horizontal vector component increasing or decreasing?
    const intersectX = r.x + (v[0] > 0 ? r.width : 0)
    // If it's a vertical line, we use the same y
    const intersectY = v[0] === 0 ? rectCentre.y : rectCentre.y + v[1] * (intersectX - rectCentre.x) / v[0];
    return [intersectX, intersectY]
  }
}
