import { NodeMetadata, NodeType } from "../Node";
import { SCHEMA_GRAPH_ID } from "./constants";
import { FieldType } from "./FieldType";

export interface SchemaNodeData {
  type: FieldType;
  propertyName: string;
  builtIn: boolean;
  group?: string;
  enum?: string[];
}

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
