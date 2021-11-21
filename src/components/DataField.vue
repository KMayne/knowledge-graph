<template>
<md-field>
  <label>{{ field.friendlyName }}</label>
  <md-select v-if="isEnum"
    :value="value" @input="handleInput">
    <md-option v-for="value, idx in field.enum" :key="value" :value="idx">{{ value }}</md-option>
  </md-select>
  <md-textarea v-if="isText"
    :value="value" @input="handleInput"></md-textarea>
  <md-input v-if="inputType !== null"
    :value="value" @input="handleInput" :type="inputType" :step="stepSize"></md-input>
</md-field>
</template>

<script lang="ts">
import { FieldMetadata, FieldType, parseFieldValue } from '@/SchemaGraph';
import Vue from 'vue';

export default Vue.extend({
  props: ['field', 'value'],
  methods: {
    handleInput(e: string) {
      this.$emit('change', parseFieldValue(e, this.field));
    }
  },
  computed: {
    isEnum() {
      return this.field.type === FieldType.Enum;
    },
    isText() {
      return this.field.type === FieldType.Text;
    },
    fieldType(): FieldType {
      return (this.field as FieldMetadata).type;
    },
    inputType(): string | null {
      switch (this.fieldType) {
        case FieldType.Boolean:
          return 'checkbox';
        case FieldType.Integer:
          return 'number';
        case FieldType.Float:
          return 'number';
        case FieldType.String:
          return 'text';
        default:
          return null;
      }
    },
    stepSize(): number | null {
      return this.fieldType === FieldType.Float ? 0.1
              : this.fieldType === FieldType.Integer ? 1 : null;
    }
  }
});
</script>

<style scoped>

</style>
