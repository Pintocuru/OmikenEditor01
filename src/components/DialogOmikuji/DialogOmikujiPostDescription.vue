<!-- src/components/DialogOmikuji/DialogOmikujiPostDescription.vue -->
<template>
 <v-row dense>
  <v-col cols="12">
   <v-card variant="outlined" class="pa-2 mt-2">
    <div class="text-subtitle-1 mb-2">使用できるプレースホルダー</div>

    <v-expansion-panels>
     <!-- 基本のプレースホルダー -->
     <v-expansion-panel>
      <v-expansion-panel-title>
       基本のプレースホルダー (クリックして表示)
       <template v-slot:actions>
        <v-icon icon="mdi-chevron-down"></v-icon>
       </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
       <v-list density="compact">
        <v-list-item v-for="placeholder in basicPlaceholders" :key="placeholder.id">
         <v-list-item-title>
          <span><<{{ placeholder.id }}>></span>
          <span class="pa-2 mt-2"> : </span>
          <i>{{ placeholder.value }}</i>
         </v-list-item-title>
         <v-list-item-subtitle>{{ placeholder.description }}</v-list-item-subtitle>
        </v-list-item>
       </v-list>
      </v-expansion-panel-text>
     </v-expansion-panel>

    </v-expansion-panels>
     <!-- その他のプレースホルダー（スクリプト、カスタム） -->
     <v-list density="compact" class="mt-4">
      <v-list-item v-for="placeholder in availablePlaceholders" :key="placeholder.id">
       <v-list-item-title>
        <span
         :class="{ 'cursor-pointer': placeholder.isEditable }"
         @click="placeholder.isEditable && openEditorItem('places', placeholder.key)"
        >
         <<{{ placeholder.id }}>>
        </span>
        <span class="pa-2 mt-2"> : </span>
        <i>{{ placeholder.value }}</i>
       </v-list-item-title>
       <v-list-item-subtitle>{{ placeholder.description }}</v-list-item-subtitle>
      </v-list-item>
     </v-list>

    <div v-if="availablePlaceholders.length === 0">
     【プレース】【スクリプト】から選ぶと、プレースホルダーを使用できるようになります。
    </div>
   </v-card>
  </v-col>
 </v-row>
</template>

<script setup lang="ts">
import { inject, Ref, computed } from 'vue';
import { ListCategory, ListEntry, OmikujiType, OmikenEntry, AppEditorType, PlaceValueType } from '@/type';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 currentItem: OmikujiType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const places = AppEditor?.value.Omiken.places;
const Scripts = AppEditor?.value.Scripts;

// コンポーザブル:FunkEmits
const { openEditorItem } = FunkEmits(emit);

// 基本のプレースホルダーのみを返すcomputed
const basicPlaceholders = [
 { id: 'gameDraws', value: 1, description: 'おみくじを起動した回数', isEditable: false, key: '' },
 { id: 'gameTotalDraws', value: 12, description: 'おみくじを起動した総回数', isEditable: false, key: '' },
 { id: 'draws', value: 1, description: 'ユーザーがおみくじを起動した回数', isEditable: false, key: '' },
 { id: 'totalDraws', value: 12, description: 'ユーザーがおみくじを起動した総回数', isEditable: false, key: '' },
 { id: 'user', value: 'テストユーザー', description: 'ユーザー名', isEditable: false, key: '' },
 { id: 'tc', value: 201, description: 'ユーザーがこれまでコメントした数', isEditable: false, key: '' },
 { id: 'lc', value: 2, description: '配信枠のコメント総数', isEditable: false, key: '' },
 { id: 'round', value: 18, description: 'ユーザーがこれまでコメントした配信枠の数', isEditable: false, key: '' }
];

// 使用可能なプレースホルダーをまとめて取得
const availablePlaceholders = computed(() => {
 const placeholders = [];

 // スクリプトのプレースホルダー
 if (props.currentItem.script?.scriptId && Scripts?.[props.currentItem.script.scriptId]) {
  placeholders.push(
   ...Scripts[props.currentItem.script.scriptId].placeholders.map((p) => ({
    id: p.id,
    value: p.value,
    description: p.description,
    isEditable: false, // スクリプトは編集不可
    key: '' // スクリプトにはキーは不要
   }))
  );
 }

 // カスタムプレースホルダー
 if (places && props.currentItem.placeIds) {
  props.currentItem.placeIds.forEach((id) => {
   const place = places[id];
   if (place) {
    placeholders.push({
     id: place.name,
     value: weightedRandom(place.values),
     description: `【 ${place.values.length} items】 ${place.description}`,
     isEditable: true, // Places は編集可能
     key: place.id // open-editor 用のキー
    });
   }
  });
 }
 return placeholders;
});

// 重み付き抽選の関数
const weightedRandom = (values: PlaceValueType[]): string => {
 const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
 let random = Math.random() * totalWeight;
 for (const item of values) {
  random -= item.weight;
  if (random <= 0) return item.value;
 }
 return values[0].value;
};
</script>

<style scoped>
.cursor-pointer {
 cursor: pointer;
 color: #1976d2; /* プライマリーカラーまたは任意の色 */
 text-decoration: underline;
}

.cursor-pointer:hover {
 opacity: 0.8;
}
</style>
