import { generateGraphId, generateNodeId, Graph } from "./KnowledgeGraphModel";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, NodeMetadata, NodeType, UserNodeTypes } from "./Node";

export type DataStore = { [key: string]: any };

export enum FieldType {
  Integer,
  Float,
  Boolean,
  String,
  Text,
  Enum,
}
export function parseFieldValue(value: string, fieldMetadata: FieldMetadata): any {
  switch (fieldMetadata.type) {
    case FieldType.Boolean:
      return value === "true";
    case FieldType.Integer:
      return parseInt(value);
    case FieldType.Float:
      return parseFloat(value);
    case FieldType.String:
    case FieldType.Text:
    case FieldType.Enum:
      return value;
  }
}

export interface SchemaNodeData {
  type: FieldType;
  propertyName: string;
  builtIn: boolean;
  group?: string;
  enum?: string[];
}

export interface FieldMetadata extends SchemaNodeData {
  id: string
  friendlyName: string
}

const SCHEMA_GRAPH_ID = 'g-4954d812-c022-48f7-9c27-39265752a341'
export class SchemaNode implements NodeMetadata {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: NodeType;
  data: { [SCHEMA_GRAPH_ID]?: SchemaNodeData };
  graph: undefined;

  constructor(
    id: string,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    type: NodeType,
    data?: SchemaNodeData) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.data = { [SCHEMA_GRAPH_ID]: data };
  }
}

export interface SchemaGraph extends Graph {
  id: string;
  nodes: SchemaNode[];
}
export function extractFields(schema: SchemaGraph): FieldMetadata[] {
  return (schema.nodes.map(node => ({
    ...node.data[SCHEMA_GRAPH_ID],
    id: node.id,
    friendlyName: node.name
  })).filter(x => x !== undefined) as FieldMetadata[]);
}

const NAME_ID = 'n-8d5a2878-60c3-4daa-85b8-4a1618fb5a17';
const TYPE_ID = 'n-0bc70656-d534-4958-a4f7-d396575c04ed';
const X_COORD_ID = 'n-2df9d699-d1f2-4846-8e1d-cf71150de644';
const Y_COORD_ID = 'n-d99a0ed8-8ea1-4385-974b-c92a4ff250a0';
const WIDTH_ID = 'n-938ff046-e892-4f07-9fe4-a27c2e060cec';
const HEIGHT_ID = 'n-91d8d772-1e34-4a69-b67f-0d66d6648b29';

export function newSchemaFromDefault(): SchemaGraph {
  return ({
    id: generateGraphId(),
    nodes: [
      new SchemaNode(
        NAME_ID, 'Name',
        -DEFAULT_WIDTH * 1.5, -DEFAULT_HEIGHT / 2,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        NodeType.BuiltIn, {
          type: FieldType.String,
          propertyName: 'name',
          builtIn: true
        }
      ), new SchemaNode(
        TYPE_ID, 'Type',
        DEFAULT_WIDTH / 2, -DEFAULT_HEIGHT / 2,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        NodeType.BuiltIn, {
          type: FieldType.Enum,
          propertyName: 'type',
          builtIn: true,
          enum: UserNodeTypes.map(t => NodeType[t])
        }
      ), new SchemaNode(
        X_COORD_ID, 'X',
        DEFAULT_WIDTH / 2, -DEFAULT_HEIGHT / 2,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        NodeType.BuiltIn, {
          group: 'Layout',
          type: FieldType.Integer,
          propertyName: 'x',
          builtIn: true
        }
      ), new SchemaNode(
        Y_COORD_ID, 'Y',
        DEFAULT_WIDTH / 2, -DEFAULT_HEIGHT / 2,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        NodeType.BuiltIn, {
          group: 'Layout',
          type: FieldType.Integer,
          propertyName: 'y',
          builtIn: true
        }
      ), new SchemaNode(
        WIDTH_ID, 'Width',
        DEFAULT_WIDTH / 2, -DEFAULT_HEIGHT / 2,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        NodeType.BuiltIn, {
          group: 'Layout',
          type: FieldType.Integer,
          propertyName: 'width',
          builtIn: true
        }
      ), new SchemaNode(
        HEIGHT_ID, 'Height',
        DEFAULT_WIDTH / 2, -DEFAULT_HEIGHT / 2,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        NodeType.BuiltIn, {
          group: 'Layout',
          type: FieldType.Integer,
          propertyName: 'height',
          builtIn: true
        }
      ), new SchemaNode(
        generateNodeId(), 'Text',
        -DEFAULT_WIDTH * 1.5, DEFAULT_HEIGHT * 1.5,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        NodeType.Normal, {
          type: FieldType.Text,
          propertyName: 'text',
          builtIn: false
        }
      )
    ],
    name: "Default Schema",
    edges: []
  });
}
