<!-- src/components/common/PartsNameEditor.vue -->
<template>
 <v-dialog v-model="dialog" persistent max-width="600px">
  <v-card>
   <v-card-title>基本情報の編集</v-card-title>
   <v-card-text>
    <v-form @submit.prevent>
     <v-text-field v-model="localItem.name" label="結果名" :rules="[(v) => !!v || '結果名は必須です']">
      <v-tooltip activator="parent" location="bottom">
       おみくじの結果の名称（ラベル）を入力してください。<br />
       例: 「大吉」「中吉」「小吉」など。
      </v-tooltip>
     </v-text-field>

     <v-textarea v-model="localItem.description" label="説明文" rows="4" />
    </v-form>
   </v-card-text>
   <v-card-actions>
    <v-spacer />
    <v-btn color="primary" @click="saveChanges">保存</v-btn>
    <v-btn @click="dialog = false">キャンセル</v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>

 <!-- 編集ボタン-->
 <v-btn icon size="small" @click.stop="dialog = true">
  <v-icon>mdi-pencil</v-icon>
 </v-btn>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { OmikenEntry, ListCategory, RulesType, OmikujiType, PlaceType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 type: ListCategory;
 currentItem: RulesType | OmikujiType | PlaceType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, updateOmikenEntry } = FunkEmits(emit);

const dialog = ref(false);
const localItem = ref({ ...props.currentItem });

watch(
 () => props.currentItem,
 (newValue) => {
  localItem.value = { ...newValue };
 },
 { deep: true }
);

const saveChanges = () => {
 updateOmikenEntry(props.type, localItem.value);
 dialog.value = false;
};
</script>
