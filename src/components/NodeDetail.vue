<template>
<section class="detail-panel">
  <h4>Node properties</h4>
  <DataField v-for="field in fields" :key="field.id" :field="field"
    :value="field.builtIn ? node[field.propertyName] : node.data[schemaId][field.propertyName]"
    @change="value => handleFieldChange(field, value)" />
</section>
</template>

<script lang="ts">
import { NodeChange, NodeFragement, UserNodeTypes } from '@/Node';
import Vue from 'vue';
import { NodeType }  from '@/Node';
import { extractFields, FieldMetadata } from '@/SchemaGraph';
import { KnowledgeGraphModel } from '@/KnowledgeGraphModel';
import DataField from './DataField.vue';

export default Vue.extend({
  props: ['node', 'graph'],
  components: { DataField },
  methods: {
    handleFieldChange(field: FieldMetadata, newValue: any) {
      const [before, after]: NodeFragement[] = field.builtIn ? [
          { [field.propertyName]: this.node[field.propertyName] },
          { [field.propertyName]: newValue }
        ] : [
          { data: this.node.data },
          { data: {
            ...this.node.data,
            [this.schemaId]: {
              ...this.node.data[this.schemaId],
              [field.propertyName]: newValue
            }
          }}
        ];
      this.$emit('action', new NodeChange(this.node.id, this.copyFragement(before),
        this.copyFragement(after), `${field.propertyName}-change[${this.node.id}`));
    },
    copyFragement(obj: NodeFragement) {
      return JSON.parse(JSON.stringify(obj));
    }
  },
  computed: {
    schemaId(): string {
      return (this.graph as KnowledgeGraphModel).schema.id;
    },
    nodeTypes(): Array<[NodeType, string]> {
      return UserNodeTypes.map(t => [t, NodeType[Number(t)]]);
    },
    fields(): FieldMetadata[] {
      return extractFields(this.graph.schema);
    },
  }
});
</script>

<style scoped>
h4 {
  margin: 8px 0 24px 0;
}
</style>
