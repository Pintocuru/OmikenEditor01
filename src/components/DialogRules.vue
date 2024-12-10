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
      <!-- Rules用フィルタリング -->
      <DialogThresholdRules
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
import { computed, inject, Ref } from "vue";
import DialogThresholdRules from "./DialogThresholdRules.vue";
import DialogRulesColor from "./DialogRulesColor.vue";
import type {
  ListEntry,
  OmikenEntry,
  ListCategory,
  OmikenEntryType,
  AppEditerType,
} from "@/types/index";
import { FunkEmits } from "@/composables/FunkEmits";

// props/emits
const props = defineProps<{
  entry: ListEntry<"rules"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenEntryType>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditer = inject<Ref<AppEditerType>>("AppEditerKey");
const rules = AppEditer?.value.Omiken.rules;

// コンポーザブル:FunkEmits
const { updateOmiken } = FunkEmits(emit);

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
</script>
