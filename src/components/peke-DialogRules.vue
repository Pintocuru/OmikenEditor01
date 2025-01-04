<!-- src/components/DialogRules.vue -->
<template>
 <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
  <v-card-text>
   <v-row dense>
    <v-col cols="8" sm="3">
     <v-text-field v-model="currentItem.name" label="おみくじ名" @input="updateOmikenEntry('rules', currentItem)">
      <v-tooltip activator="parent" location="bottom">
       わかりやすいおみくじの名称（ラベル）を入力してください
      </v-tooltip>
     </v-text-field>
    </v-col>
    <v-col cols="4" sm="auto">
     <PartsToolbarColor v-model="currentItem.color" @update:model-value="updateOmikenEntry('rules', currentItem)" />
    </v-col>
    <v-col>
     <v-text-field v-model="currentItem.description" label="説明文" @input="updateOmikenEntry('rules', currentItem)" />
    </v-col>
   </v-row>
   <!-- 条件設定 -->
   <DialogThreshold
    :item="currentItem"
    type="comment"
    mode="rules"
     @update:Omiken="updateOmiken"
   />
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">アイテムが選択されていないか、データの形式が正しくありません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from 'vue';
import type { ListEntry, OmikenEntry, ListCategory, AppEditorType, TypesType } from '@type';
import DialogThreshold from '@/components/DialogThreshold/DialogThreshold.vue';
import PartsToolbarColor from '@/components/common/PartsToolbarColor.vue';
import { FunkEmits } from '@/composables/FunkEmits';

// props/emits
const props = defineProps<{
 entry: ListEntry<'rules'> | null;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey') ?? ref({} as AppEditorType);
const types = AppEditor?.value.Omiken.types;
const rules = AppEditor?.value.Omiken.rules;

// rulesがどのtypeか探す
const type = computed(() => findRuleType(types || {}, (props.entry?.key as string) || ''));

// コンポーザブル:FunkEmits
const { updateOmiken,updateOmikenEntry } = FunkEmits(emit);

// propsからデータを解読
const currentItem = computed(() => (props.entry?.key && rules ? rules[props.entry.key as string] : null));

function findRuleType(types: Record<TypesType, string[]>, ruleId: string): TypesType | undefined {
 return Object.entries(types).find(([, ruleIds]) => ruleIds.includes(ruleId))?.[0] as TypesType | undefined;
}
</script>
