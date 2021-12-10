import { Edge } from "../Edge";
import { generateGraphId, Graph } from "../Graph";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, generateNodeId, NodeType, UserNodeTypes } from "../Node";
import { BaseSchema } from "./BaseSchema";
import { SCHEMA_GRAPH_ID } from "./constants";
import { FieldMetadata } from "./FieldMetadata";
import { FieldType } from "./FieldType";
import { SchemaNode } from "./SchemaNode";

export type DataStore = { [key: string]: any };

export class SchemaGraph implements Graph {
  id: string;
  name: string;
  nodes: SchemaNode[];
  edges: Edge[];

  constructor(name: string, nodes: SchemaNode[]) {
    this.id = generateGraphId();
    this.name = name;
    this.nodes = nodes;
    this.edges = [];
  }
}

export function extractFields(schema: SchemaGraph): FieldMetadata[] {
  return (schema.nodes.map(node => ({
    ...node.data[SCHEMA_GRAPH_ID],
    id: node.id,
    friendlyName: node.name
  })).filter(x => x !== undefined) as FieldMetadata[]);
}

export function newSchemaFromDefault(): SchemaGraph {
  return new SchemaGraph('Default Schema', [
    ...BaseSchema,
    new SchemaNode(
      generateNodeId(), 'Text',
      -DEFAULT_WIDTH * 1.5, DEFAULT_HEIGHT * 1.5,
      DEFAULT_WIDTH, DEFAULT_HEIGHT,
      NodeType.Normal, {
        type: FieldType.Text,
        propertyName: 'text',
        builtIn: false
      }
    )
  ]);
}
