import { SchemaNodeData } from "./SchemaNode";

export interface FieldMetadata extends SchemaNodeData {
  id: string
  friendlyName: string
}
