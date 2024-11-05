<!-- src/components/DialogRules.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-row dense>
        <v-col cols="8" sm="3">
          <v-text-field
            v-model="currentItem.name"
            label="おみくじ名"
            @input="updateItem"
          >
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
          <v-text-field
            v-model="currentItem.description"
            label="説明文"
            @input="updateItem"
          />
        </v-col>
      </v-row>
      <!-- おみくじワード -->
      <v-card>
        <v-toolbar :color="currentItem.color" density="compact">
          <v-toolbar-title> おみくじワード💬 </v-toolbar-title>
        </v-toolbar>
        <v-combobox
          v-model="currentItem.matchStartsWith"
          label="前方一致"
          chips
          multiple
          @update:modelValue="updateItem"
        />
      </v-card>

      <!-- フィルタリング -->
      <DialogThreshold
        :currentItem="currentItem"
        @update:Omiken="updateOmiken"
      />
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >アイテムが選択されていないか、データの形式が正しくありません。</v-alert
  >
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


// propsからデータを解読
const currentItem = computed(() =>
  props.entry?.key && rules ? rules[props.entry.key as string] : null
);

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
