import { FieldMetadata } from "./FieldMetadata";
import { FieldType } from "./FieldType";

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

export const SchemaFields: FieldMetadata[] = [
  {
    id: 'n-cf8b7840-75f9-43b7-8b6c-b7ea847fe6de',
    friendlyName: 'Type',
    type: FieldType.Enum,
    propertyName: 'type',
    builtIn: true
  }, {
    id: 'n-931b5979-864a-47b5-8820-7f822661aab6',
    friendlyName: 'Property Name',
    type: FieldType.String,
    propertyName: 'propertyName',
    builtIn: true
  }, {
    id: 'n-d5fd2920-5b82-4e6a-83af-833459d987b2',
    friendlyName: 'Built In',
    type: FieldType.Boolean,
    propertyName: 'buildIn',
    builtIn: true
  }, {
    id: 'n-6a712cc2-e1f2-4e00-8de7-2fed147be426',
    friendlyName: 'Group',
    type: FieldType.String,
    propertyName: 'group',
    builtIn: true
  }, {
    id: 'n-5cb0f3aa-a2fe-410f-a8c8-6f1bc1a97a6b',
    friendlyName: 'Enum',
    type: FieldType.Enum,
    propertyName: 'enum',
    builtIn: true
  }
];
