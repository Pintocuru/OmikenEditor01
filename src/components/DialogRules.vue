<!-- src/components/DialogRules.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-row dense>
        <v-col cols="8" sm="3">
          <v-text-field v-model="currentItem.name" label="おみくじ名" @input="updateItem">
            <v-tooltip activator="parent" location="bottom">
              わかりやすいおみくじの名称（ラベル）を入力してください
            </v-tooltip>
          </v-text-field>
        </v-col>
     <v-col cols="4" sm="auto">
  <DialogRulesColor
    v-model="currentItem.color"
    @update:model-value="updateItem"
  />
</v-col>
        <v-col>
          <v-text-field v-model="currentItem.description" label="説明文" @input="updateItem" />
        </v-col>
      </v-row>
      <!-- おみくじワード -->
      <v-card>
        <v-toolbar :color="currentItem.color" density="compact">
          <v-toolbar-title> おみくじワード </v-toolbar-title>
        </v-toolbar>
  <v-combobox
    v-model="currentItem.matchStartsWith"
    label="前方一致"
    chips
    multiple
    @update:modelValue="updateItem"
  />
      </v-card>

      <!-- タブ -->
<v-tabs v-model="tab" class="w-100">
  <v-tab value="post" class="d-flex align-center w-50">
    該当するおみくじ
    <v-badge v-if="currentItem?.enabledIds?.length" :content="currentItem.enabledIds.length" color="primary" class="ms-2">
      <v-icon size="small">mdi-message-text</v-icon>
    </v-badge>
  </v-tab>
  <v-tab value="filter" class="d-flex align-center w-50">
    フィルタリング
    <v-badge v-if="currentItem?.threshold" color="primary" class="ms-2">
      <v-icon size="small">mdi-filter-variant</v-icon>
    </v-badge>
  </v-tab>
</v-tabs>

      <!-- タブの内容 -->
      <v-window v-model="tab">
        <v-window-item value="post">
          <!-- 該当するおみくじ🥠 -->
          <v-card>
            <v-toolbar :color="currentItem.color" density="compact">
              <v-toolbar-title> 該当するおみくじ🥠 </v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-select v-model="currentItem.enabledIds" :items="omikujiLists" label="有効にするID" chips multiple
                item-title="name" item-value="id" @update:modelValue="updateItem" />
              <v-alert v-if="enabledOmikujiLists.length === 0" type="warning">
                少なくとも1つのおみくじを有効にしてください
              </v-alert>
              <v-sheet v-else>
                <v-row no-gutters>
                  <v-col v-for="option in enabledOmikujiLists" :key="option.id" cols="12" sm="6" md="4" lg="3"
                    class="pa-1">
                    <v-card class="d-flex justify-space-between align-center pa-2 py-5" variant="outlined"
                      :color="weightColor(option.id)" @click.stop="openEditorOmikuji(option)">
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
        </v-window-item>
        <v-window-item value="filter">
          <!-- フィルタリング -->
          <DialogThreshold :currentItem="currentItem" @update:Omiken="updateOmiken" />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">アイテムが選択されていないか、データの形式が正しくありません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from "vue";
import DialogThreshold from "./DialogThreshold.vue";
import DialogRulesColor from "./DialogRulesColor.vue";
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

// ref
const tab = ref("post"); // タブの状態管理

// propsからデータを解読
const currentItem = computed(() =>
  props.entry?.key && rules ? rules[props.entry.key as string] : null
);

// コンポーザブル:funkRules
const {
  weightTotal: totalWeight,
  weightPercentage: totalWeightPercentage,
  omikujiLists,
  enabledOmikujiLists,
  weightColor,
} = funkRules(omikuji, omikujiOrder, currentItem);

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
      mode: null,
      key: option.id,
    });
  }
};

// 子コンポーネントのOmiken更新
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
