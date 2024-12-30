<!-- src/components/DialogThreshold/ThresholdMain.vue -->
<template>
 <v-card-text>
  <!-- しきい値リスト -->
  <v-row>
   <v-col v-for="(threshold, index) in thresholds" :key="index" cols="12" :sm="maxArray === 1 ? 12 : 4">
    <!-- 内容 -->
    <v-card
     elevation="2"
     class="pa-4 position-relative cursor-pointer"
     variant="elevated"
     color="yellow lighten-3"
     :height="maxArray === 1 ? 70 : 100"
     @click="dialog = true"
    >
     <!-- 閉じるボタン -->
     <v-btn
      icon
      size="small"
      variant="text"
      class="position-absolute"
      style="top: -8px; right: -8px"
      @click.stop="removeThreshold(index)"
      :disabled="thresholds.length <= minArray"
     >
      <v-icon>mdi-close</v-icon>
     </v-btn>
     <div class="text-center">🔐 {{ getExampleText([threshold]) }}</div>
    </v-card>
   </v-col>

   <!-- 新規追加ボタン -->
   <v-col cols="12" :sm="maxArray === 1 ? 12 : 4" v-show="thresholds.length < maxArray">
    <v-card
     elevation="2"
     :height="maxArray === 1 ? 70 : 100"
     class="d-flex align-center justify-center cursor-pointer"
     color="grey-lighten-4"
     @click="addThreshold"
    >
     <div class="text-center">
      <v-icon size="32" color="primary" class="mb-2"> mdi-plus-circle </v-icon>
      <div class="text-primary">条件を追加</div>
     </div>
    </v-card>
   </v-col>
  </v-row>
 </v-card-text>

 <!-- 現在選択中のしきい値の詳細編集 -->
 <v-dialog v-model="dialog" max-width="800px" persistent :scrim="true">
  <v-card v-if="currentIndex !== null">
   <v-card-title class="text-h6">
    条件の編集
   </v-card-title>
   <v-card-text>
    <!-- 条件リスト(ボタン選択) -->
    <ThresholdSelect :threshold="thresholds[currentIndex]" @update:condition="updateConditionType" />

    <!-- 条件タイプに応じたコンポーネント -->
    <component
     :is="getComponent"
     :threshold="thresholds[currentIndex]"
     :type="type"
     @update:threshold="updateThreshold"
    />
   </v-card-text>
   <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn color="primary" variant="text" @click="dialog = false"> 閉じる </v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
 ThresholdType,
 ConditionType,
 TypesType,
 RulesType,
 OmikujiType,
 OmikenEntry,
 ListCategory
} from '@type';
import { FunkThresholdInitial, FunkThreshold } from '@/composables/FunkThreshold';

import ThresholdSelect from './ThresholdSelect.vue';
import ThresholdSimple from './ThresholdSimple.vue';
import ThresholdCount from './ThresholdCount.vue';
import ThresholdMatch from './ThresholdMatch.vue';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 item: RulesType | OmikujiType;
 type: TypesType;
 mode: 'rules' | 'omikujis';
}>();
// typeのdefaultはcomment
const maxArray = computed(() => (props.mode === 'rules' ? 3 : 1));
const minArray = computed(() => (props.mode === 'rules' ? 1 : 0));

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
}>();

const dialog = ref(false);

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, openEditorItem, updateOmikenEntry } = FunkEmits(emit);

const { getExampleText } = FunkThreshold();

// 現在編集中のしきい値のインデックス
const currentIndex = ref<number | null>(null);

// しきい値リスト
const thresholds = ref<ThresholdType[]>(props.item.threshold);

// 条件タイプに応じたコンポーネントを動的に選択
const getComponent = computed(() => {
 if (currentIndex.value === null) return null;

 const conditionComponentMap = {
  target: ThresholdSimple,
  coolDown: ThresholdSimple,
  syoken: ThresholdSimple,
  access: ThresholdSimple,
  count: ThresholdCount,
  match: ThresholdMatch
 };

 return conditionComponentMap[thresholds.value[currentIndex.value].conditionType];
});

// しきい値追加
const addThreshold = () => {
 if (thresholds.value.length < 3) {
  thresholds.value.push(FunkThresholdInitial());
  currentIndex.value = thresholds.value.length - 1;
  emitUpdate();
 }
};

// しきい値削除
const removeThreshold = (index: number) => {
 if (thresholds.value.length > minArray.value) {
  thresholds.value.splice(index, 1);
  currentIndex.value =
   currentIndex.value !== null && currentIndex.value >= thresholds.value.length
    ? thresholds.value.length - 1
    : currentIndex.value;
  emitUpdate();
 }
};

// 条件タイプ更新
const updateConditionType = (condition: ConditionType) => {
 if (currentIndex.value !== null) {
  thresholds.value[currentIndex.value].conditionType = condition;
  emitUpdate();
 }
};

// しきい値更新
const updateThreshold = (updatedThreshold: ThresholdType) => {
 if (currentIndex.value !== null) {
  thresholds.value[currentIndex.value] = updatedThreshold;
  emitUpdate()
 }
};

// 親コンポーネントへ更新を通知
const emitUpdate = () => {
 updateOmikenEntry(props.mode, { ...props.item, threshold: thresholds.value });
};

// 初期状態で最初のしきい値を選択
currentIndex.value = 0;
</script>
