<!-- src/components/DialogThreshold/DialogThreshold-moto.vue -->
<template>
 <v-dialog v-model="dialog" max-width="600px">
  <v-card v-if="threshold">
   <v-toolbar :color="themeColor" density="compact">
    <v-toolbar-title>
     🔐 フィルタリング設定
     <v-chip density="compact" variant="outlined" color="yellow lighten-3" class="ml-4">
      🔐 {{ getExampleText(props.threshold) }}
     </v-chip>
    </v-toolbar-title>
   </v-toolbar>
   <v-card-text>
    <!-- アイコン -->
    <v-row justify="space-around">
     <v-col v-for="item in conditions" :key="item.value" cols="auto">
      <v-tooltip location="top">
       <template v-slot:activator="{ props }">
        <v-btn
         icon
         :variant="threshold.conditionType === item.value ? 'elevated' : 'flat'"
         :color="threshold.conditionType === item.value ? themeColor : ''"
         v-bind="props"
         @click="updateConditionType(item.value)"
        >
         <v-icon>{{ item.icon }}</v-icon>
        </v-btn>
       </template>
       <span>{{ item.label }}: {{ item.description }}</span>
      </v-tooltip>
     </v-col>
    </v-row>
    <!-- target:多重投稿チェック -->
    <v-sheet v-if="threshold.conditionType === 'target'" class="pt-8"> (詳細設定はありません) </v-sheet>
    <!-- coolDown:クールダウンチェック -->
    <v-sheet v-if="threshold.conditionType === 'coolDown'" class="pt-8">
     <v-text-field
      v-model.number="currentItem.value1"
      type="number"
      min="1"
      max="3600"
      label="指定した時間(秒)"
      @update:modelValue="updateThreshold"
     />
    </v-sheet>
    <!-- syoken:初見・久しぶり -->
    <v-slider
     v-if="threshold.conditionType === 'syoken'"
     v-model="threshold.syoken"
     :min="1"
     :max="3"
     :step="1"
     show-ticks="always"
     tick-size="4"
     :ticks="[SyokenCondition.SYOKEN, SyokenCondition.AGAIN, SyokenCondition.HI]"
     @update:modelValue="updateThreshold"
    >
     <template #tick-label="{ tick }">
      {{ EXAMPLES.syoken[tick.value as SyokenCondition] }}
     </template>
    </v-slider>

    <!-- access -->
    <v-slider
     v-if="threshold.conditionType === 'access'"
     v-model="threshold.access"
     :min="2"
     :max="4"
     :step="1"
     show-ticks="always"
     tick-size="4"
     :ticks="[AccessCondition.MEMBER, AccessCondition.MODERATOR, AccessCondition.ADMIN]"
     @update:modelValue="updateThreshold"
    >
     <template #tick-label="{ tick }">
      {{ EXAMPLES.access[tick.value as AccessCondition] }}
     </template>
    </v-slider>
    <!-- count -->
    <v-sheet v-if="threshold.conditionType === 'count'" class="pt-8">
     <ThresholdCount v-model="threshold" @update:modelValue="handleChange(threshold)" />
    </v-sheet>

    <!-- match -->
    <v-sheet v-if="threshold.conditionType === 'match'" class="pt-8">
     <v-combobox
      v-model="threshold.match"
      label="含まれるキーワード"
      chips
      multiple
      clearable
      @update:modelValue="handleChange(threshold)"
     />
    </v-sheet>
   </v-card-text>
  </v-card>
 </v-dialog>

 <v-card @click="dialog = true" color="primary"> フィルタリング設定を開く </v-card>
</template>

<script setup lang="ts">
import { FunkEmits } from '@/composables/FunkEmits';
import { OmikenEntry, ListCategory, RulesType, ThresholdType, ConditionType, AccessCondition } from '@/type';
import { FunkThreshold, FunkThresholdInitial } from '@/composables/FunkThreshold';
import ThresholdCount from './ThresholdCount.vue';

import { ref } from 'vue';

// props/emits
const props = defineProps<{
 currentItem: RulesType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
}>();

const dialog = ref(false);

const threshold = ref<ThresholdType>({
 ...FunkThresholdInitial(), // 初期値を付与
 ...props.currentItem.threshold
});

// コンポーザブル:FunkThreshold
const { EXAMPLES, getExampleText } = FunkThreshold();
// コンポーザブル:FunkEmits
const { updateOmiken } = FunkEmits(emit);

// フィルタリングの並び順
const conditions: ConditionType[] = ['target', 'coolDown', 'syoken', 'access', 'count', 'match'];

// 更新処理
const updateThreshold = () => {
 if (!props.currentItem) return;
 const update = {
  [props.currentItem.id]: props.currentItem
 };
 emit('update:Omiken', { type: 'rules', update });
};
</script>
