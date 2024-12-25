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
      <!-- 条件設定 -->
      <ThresholdMain
        :Thresholds="currentItem.threshold"
        :type="'comment'"
        @update:Thresholds="updateItem"
      />
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning"
    >アイテムが選択されていないか、データの形式が正しくありません。</v-alert
  >
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from "vue";
import type {
  ListEntry,
  OmikenEntry,
  ListCategory,
  AppEditorType,
  TypesType,
  RulesType,
} from "@/type";
import ThresholdMain from "@/components/DialogThreshold/ThresholdMain.vue";
import DialogRulesColor from "@/components/DialogRulesColor.vue";
import { FunkEmits } from "@/composables/FunkEmits";

// props/emits
const props = defineProps<{
  entry: ListEntry<"rules"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<ListCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppEditor =
  inject<Ref<AppEditorType>>("AppEditorKey") ?? ref({} as AppEditorType);
const types = AppEditor?.value.Omiken.types;
const rules = AppEditor?.value.Omiken.rules;

// rulesがどのtypeか探す
const type = computed(() => findRuleType(types || {}, props.entry?.key as string || ''));

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

function findRuleType(
  types: Record<TypesType, string[]>,
  ruleId: string
): TypesType | undefined {
  return Object.entries(types).find(([, ruleIds]) =>
    ruleIds.includes(ruleId)
  )?.[0] as TypesType | undefined;
}
</script>
