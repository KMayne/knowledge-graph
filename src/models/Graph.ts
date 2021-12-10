import { v4 as uuidV4 } from 'uuid';
import { GraphV1, SerialisedGraphV1 } from "@/migrations/v1";

export type Graph = GraphV1;
export type SerialisedGraph = SerialisedGraphV1;

export function generateGraphId(): string {
  return `g-${uuidV4()}`;
}
