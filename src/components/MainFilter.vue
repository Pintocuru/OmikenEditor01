<!-- src/components/MainFilter.vue -->
<template>
  <v-card-text>
    <v-row v-if="selectCategory === 'rules'">
      <v-col>
        <v-switch
          v-model="localFilterOptions.showAllRules"
          label="全てのルールを表示"
          @change="emitUpdate"
        />
      </v-col>
    </v-row>
    <v-row v-if="selectCategory === 'omikuji'">
      <v-col>
        <v-select
          v-model="localFilterOptions.omikujiSort"
          :items="[
            { title: '重み付け（高い順）', value: 'weightDesc' },
            { title: '重み付け（低い順）', value: 'weightAsc' },
          ]"
          item-title="title"
          item-value="value"
          label="ソート"
          @change="emitUpdate"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="localFilterOptions.omikujiFilter"
          :items="[
            { title: '全て', value: 'all' },
            { title: '時間指定', value: 'time' },
            { title: 'コメント番号', value: 'lc' },
            // 他のthreshold.typeオプションも追加
          ]"
          item-title="title"
          item-value="value"
          label="フィルター"
          @change="emitUpdate"
        />
      </v-col>
    </v-row>
    <v-row v-if="selectCategory === 'placeholder'">
      <v-col>
        <v-select
          v-model="localFilterOptions.placeholderSort"
          :items="[
          { title: 'なし', value: 'none' },
          { title: 'プレースホルダー名', value: 'name' },
          { title: 'グループ', value: 'group' },
        ]"
        item-title="title"
        item-value="value"
        label="グループ化"
          @change="emitUpdate"
        />
      </v-col>
    </v-row>
  </v-card-text>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ItemType } from "../AppTypes";
import { OmikujiThresholdType } from '@/types';

type OmikujiSortOption = 'weightDesc' | 'weightAsc';
type PlaceholderSortOption = 'none' | 'name' | 'group';
const props = defineProps<{
  selectCategory: ItemType;
  filterOptions: {
    showAllRules: boolean;
    omikujiSort: OmikujiSortOption;
    omikujiFilter: 'all' | OmikujiThresholdType;
    placeholderSort: PlaceholderSortOption;
  };
}>();

const emit = defineEmits<{
  (e: 'update-filter', options: Partial<typeof props.filterOptions>): void;
}>();

const localFilterOptions = ref(props.filterOptions);

watch(() => props.filterOptions, (newOptions) => {
  localFilterOptions.value = newOptions;
}, { deep: true });

const emitUpdate = () => {
  emit('update-filter', localFilterOptions.value);
};
</script>