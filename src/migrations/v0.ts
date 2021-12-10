import { Edge } from "@/models/Edge";
import { NodeMetadata } from "@/models/Node";
import { SerialisedObject } from ".";

export interface GraphV0 {
  name: string;
  nodes: NodeMetadata[];
  edges: Edge[];
}
export type SerialisedGraphV0 = GraphV0 & SerialisedObject
