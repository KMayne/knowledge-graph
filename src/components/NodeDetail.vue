<template>
<section class="detail-panel">
  <h4>Node properties</h4>
  <v-expansion-panels :multiple="true" :accordion="true" v-model="openPanels">
    <v-expansion-panel v-for="(fields, groupName) in groupedFields" :key="groupName">
      <v-expansion-panel-header>
        {{ groupName }}
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <DataField v-for="field in fields" :key="field.id" :field="field"
          :value="field.builtIn ? node[field.propertyName] : node.data[schemaId][field.propertyName]"
          @change="value => handleFieldChange(field, value)" />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

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
  data: () => ({
    openPanels: [0]
  }),
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
    groupedFields(): Record<string, FieldMetadata[]> {
      // Pre-populate with General so it appears first
      const groups: Record<string, FieldMetadata[]> = { 'General': [] };
      extractFields(this.graph.schema).forEach(f => {
        const fieldGroup = f.group || 'General';
        if (!groups[fieldGroup]) { groups[fieldGroup] = []; }
        groups[fieldGroup].push(f);
      });
      return groups;
    },
  }
});
</script>

<style scoped>
h4 {
  margin: 24px 16px 16px 16px;
  /* padding: 8px 16px; */

}

.v-item-group {
  position: static;
}
</style>
