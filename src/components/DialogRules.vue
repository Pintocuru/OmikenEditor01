<!-- src/components/DialogRules.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="currentItem.name"
            label="おみくじ名"
            @input="updateItem"
          />
        </v-col>
        <v-col cols="12" sm="8">
          <v-slider
            v-model="currentItem.switch"
            :max="4"
            :ticks="switchLabels"
            show-ticks="always"
            step="1"
            tick-size="4"
            :color="getSwitchColor(currentItem.switch)"
            @update:modelValue="updateItem"
          />
        </v-col>
      </v-row>
      <!-- おみくじワード -->
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title> おみくじワード </v-toolbar-title>
        </v-toolbar>
        <v-sheet class="d-flex ga-2">
          <v-combobox
            v-for="(label, key) in matchLabels"
            :key="key"
            v-model="currentItem[key]"
            :label="label"
            clearable
            chips
            multiple
            @update:modelValue="updateItem"
            style="flex: 1"
          />
        </v-sheet>
      </v-card>
      <!-- 該当するおみくじ🥠 -->
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title> 該当するおみくじ🥠 </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-select
            v-model="currentItem.enabledIds"
            :items="omikujiLists"
            label="有効にするID"
            chips
            multiple
            item-title="name"
            item-value="id"
            @update:modelValue="updateItem"
          />
          <v-alert v-if="enabledOmikujiLists.length === 0" type="warning">
            少なくとも1つのおみくじを有効にしてください
          </v-alert>
          <v-sheet v-else>
            <v-row no-gutters>
              <v-col
                v-for="option in enabledOmikujiLists"
                :key="option.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="pa-1"
              >
                <v-card
                  class="d-flex justify-space-between align-center pa-2 py-5"
                  variant="outlined"
                  :color=weightColor(option.id)
                  @click.stop="openEditorOmikuji(option)"
                >
                  <span class="font-weight-bold">
                    {{ option.name }}
                  </span>
                  <span>
                      {{ option.weight }}/{{ totalWeight() }}
                    <span class="ml-2">
                      ({{ totalWeightPercentage(option.id) }}%)
                    </span>
                  </span>
                </v-card>
              </v-col>
            </v-row>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >アイテムが選択されていないか、データの形式が正しくありません。</v-alert
  >
</template>

<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import type {
  ListEntry,
  OmikenEntry,
  ListCategory,
  OmikenCategory,
  AppStateType,
} from "../types";
import { funkRules } from "../composables/funkRules";

// props/emits
const props = defineProps<{
  entry: ListEntry<"rules"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const rules = AppState?.value.Omiken.rules;
const omikuji = AppState?.value.Omiken.omikuji;
const omikujiOrder = AppState?.value.Omiken.omikujiOrder;

// propsからデータを解読
const currentItem = computed(() => {
  const key = props.entry?.key;
  console.log(key);
  if (typeof key === "string" && rules) return rules[key];
  return null;
});

// コンポーザブル:funkRules
const {
  switchLabels,
  totalWeight,
  totalWeightPercentage,
  getSwitchLabel,
  getSwitchColor,
  omikujiLists,
  enabledOmikujiLists,
  weightColor,
} = funkRules(
  omikuji,
  omikujiOrder,
  currentItem
);

// マッチングのラベル
const matchLabels = {
  matchExact: "完全一致",
  matchStartsWith: "前方一致",
  matchIncludes: "部分一致",
};

// 更新処理
const updateItem = () => {
  if (currentItem.value) {
    emit("update:Omiken", {
      type: "rules",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};

// omikujiのエディターを開く
const openEditorOmikuji = (option: { id: string; name: string }) => {
  const omi = omikuji?.[option.id];
  if (omi) {
    emit("open-editor", {
      isOpen: true,
      type: "omikuji",
      key: option.id,
    });
  }
};
</script>
