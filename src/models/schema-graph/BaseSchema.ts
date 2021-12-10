import { DEFAULT_HEIGHT, DEFAULT_WIDTH, NodeType, UserNodeTypes } from "../Node";
import { HEIGHT_ID, NAME_ID, TYPE_ID, WIDTH_ID, X_COORD_ID, Y_COORD_ID } from "./constants";
import { FieldType } from "./FieldType";
import { SchemaNode } from "./SchemaNode";


export const BaseSchema = [
  new SchemaNode(
    NAME_ID, 'Name',
    -DEFAULT_WIDTH * 1.5, -DEFAULT_HEIGHT / 2,
    DEFAULT_WIDTH, DEFAULT_HEIGHT,
    NodeType.BuiltIn, {
      type: 0,
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
    -DEFAULT_WIDTH * 1.5, DEFAULT_HEIGHT * 1.5,
    DEFAULT_WIDTH, DEFAULT_HEIGHT,
    NodeType.BuiltIn, {
      group: 'Layout',
      type: FieldType.Integer,
      propertyName: 'x',
      builtIn: true
    }
  ), new SchemaNode(
    Y_COORD_ID, 'Y',
    DEFAULT_WIDTH * 1.5, DEFAULT_HEIGHT * 1.5,
    DEFAULT_WIDTH, DEFAULT_HEIGHT,
    NodeType.BuiltIn, {
      group: 'Layout',
      type: FieldType.Integer,
      propertyName: 'y',
      builtIn: true
    }
  ), new SchemaNode(
    WIDTH_ID, 'Width',
    -DEFAULT_WIDTH / 2, DEFAULT_HEIGHT * 3,
    DEFAULT_WIDTH, DEFAULT_HEIGHT,
    NodeType.BuiltIn, {
      group: 'Layout',
      type: FieldType.Integer,
      propertyName: 'width',
      builtIn: true
    }
  ), new SchemaNode(
    HEIGHT_ID, 'Height',
    DEFAULT_WIDTH * 1.5, DEFAULT_HEIGHT * 3,
    DEFAULT_WIDTH, DEFAULT_HEIGHT,
    NodeType.BuiltIn, {
      group: 'Layout',
      type: FieldType.Integer,
      propertyName: 'height',
      builtIn: true
    }
  )
];
