import { Edge } from "@/models/Edge";
import { generateGraphId } from "@/models/Graph";
import { NodeMetadata } from "@/models/Node";
import { newSchemaFromDefault, SchemaGraph } from "@/models/schema-graph";
import { SerialisedObject } from ".";
import { SerialisedGraphV0 } from "./v0";

export interface GraphV1 {
  id: string;
  name: string;
  nodes: NodeMetadata[];
  edges: Edge[];
  schema?: SchemaGraph;
}
export type SerialisedGraphV1 = GraphV1 & SerialisedObject

export const latestVersion: Version = {
  major: 1,
  minor: 0,
  patch: 0
};

export function v0ToV1(graph: SerialisedObject): SerialisedGraphV1 {
  const v0Graph = graph as SerialisedGraphV0;
  return {
    ...v0Graph,
    id: generateGraphId(),
    schema: newSchemaFromDefault(),
    version: latestVersion
  };
}
