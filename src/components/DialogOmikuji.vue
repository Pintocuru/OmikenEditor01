<!-- src/components/DialogOmikuji.vue -->
<template>
  <v-card v-if="currentItem" style="max-height: 80vh; overflow-y: auto">
    <v-card-text>
      <v-form @submit.prevent>
        <!-- 基本情報 -->
        <v-row dense>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="currentItem.name"
              label="結果名"
              density="compact"
              @input="updateOmikuji"
            >
              <v-tooltip activator="parent" location="bottom">
                おみくじの結果の名称（ラベル）を入力してください。<br />
                例: 「大吉」「中吉」「小吉」など。
              </v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="3" sm="2">
            <v-text-field
              v-model.number="currentItem.weight"
              label="出現比"
              type="number"
              min="0"
              max="100"
              density="compact"
              @input="updateOmikuji"
            >
              <v-tooltip activator="parent" location="bottom">
                ランダムに偏りをつける
              </v-tooltip>
            </v-text-field>
          </v-col>
          <v-col cols="9" sm="7">
            <!-- ルール別の出現率表示 -->
            <v-menu location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  color="primary"
                  v-bind="props"
                  :disabled="!usedInRules.length"
                  class="mr-2"
                >
                  {{ selectedRuleName }}
                  <v-chip size="x-small" class="ml-2" color="primary">
                    {{ selectedRuleWeight }}%
                  </v-chip>
                </v-btn>
              </template>

              <v-list>
                <v-list-subheader>ルール別の出現確率</v-list-subheader>
                <v-list-item
                  v-for="rule in usedInRules"
                  :key="rule.id"
                  :value="rule.id"
                  @click="selectRuleId = rule.id"
                >
                  <v-list-item-title class="d-flex justify-space-between">
                    <span>{{ rule.name }}</span>
                    <v-chip size="small" color="primary">
                      {{ calculateWeight(rule.id) }}%
                    </v-chip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>

        <v-tabs v-model="tab" class="w-100">
          <v-tab value="post" class="d-flex align-center w-50">
            メッセージ
            <v-badge
              v-if="postCount ? postCount > 0 : 0"
              :content="postCount"
              color="primary"
              class="ms-2"
            >
              <v-icon size="small">mdi-message-text</v-icon>
            </v-badge>
          </v-tab>
          <v-tab value="filter" class="d-flex align-center w-50">
            フィルタリング
            <v-badge
              v-if="activeFilters && activeFilters.length > 0"
              :content="
                currentItem?.threshold.isSyoken ? 1 : activeFilters.length
              "
              color="primary"
              class="ms-2"
            >
              <v-icon size="small">mdi-filter-variant</v-icon>
            </v-badge>
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="post">
            <DialogOmikujiPost
              :currentItem="currentItem"
              @update:Omiken="updateOmiken"
            />
          </v-window-item>
          <v-window-item value="filter">
            <DialogOmikujiFilter
              :currentItem="currentItem"
              @update:Omiken="updateOmiken"
            />
          </v-window-item>
        </v-window>
      </v-form>
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import type {
  OmikenEntry,
  ListEntry,
  AppStateType,
  OmikenCategory,
  ListCategory,
} from "../types";
import { funkOmikuji } from "../composables/funkDialog";
import DialogOmikujiFilter from "./DialogOmikujiFilter.vue";
import DialogOmikujiPost from "./DialogOmikujiPost.vue";
import _ from "lodash";
import { funkRules } from "@/composables/funkRules";
// props/emits
const props = defineProps<{
  entry: ListEntry<"omikuji"> | null;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// キャラクターデータのインジェクト
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const rules = AppState?.value.Omiken.rules;
const omikuji = AppState?.value.Omiken.omikuji;
const CHARA = AppState?.value.CHARA;

// コンポーザブルの使用
const { thresholdTypes, comparisonItems } = funkOmikuji(CHARA);
const { validOmikujiOptions } = funkRules(omikuji, null);

// ref
const tab = ref("post"); // タブの状態管理
const selectRuleId = ref<string | null>(null); // 選択中のルールID

// propsからデータを解読 // TODO 共通コンポーザブルfunkDialogAll でcurrentItemを制定したいな?
const currentItem = computed(() => {
  const item = props.entry?.item;
  return item ? Object.values(item)[0] : null;
});

// postのアイテム数
const postCount = computed(() => {
  if (!currentItem.value) return;
  return currentItem.value.post.length;
});

// アクティブなフィルタリング
const activeFilters = computed(() => {
  if (!currentItem.value) return;
  const threshold = currentItem.value.threshold;
  const filters = [];

  if (threshold.isSyoken) {
    filters.push({
      type: "syoken",
      icon: "mdi-account-star",
      color: "primary",
    });
    // isSyoken=trueならこれだけ返せばOK
    return filters;
  }
  if (threshold.time.isEnabled) {
    filters.push({
      type: "time",
      icon: "mdi-clock-outline",
      color: "success",
    });
  }
  if (threshold.elapsed.isEnabled) {
    filters.push({
      type: "elapsed",
      icon: "mdi-timer-outline",
      color: "info",
    });
  }
  if (threshold.count.isEnabled) {
    filters.push({
      type: "count",
      icon: "mdi-counter",
      color: "warning",
    });
  }
  if (threshold.gift.isEnabled) {
    filters.push({
      type: "gift",
      icon: "mdi-gift-outline",
      color: "error",
    });
  }

  return filters;
});

// このおみくじが使われているRulesを探す
const usedInRules = computed(() => {
  if (!currentItem.value || !rules) return [];

  return Object.values(rules).filter(
    (rule) =>
      rule.enabledIds.length === 0 ||
      rule.enabledIds.includes(currentItem.value!.id)
  );
});

// 選択中のルール名とその重み
const selectedRuleName = computed(() => {
  if (!selectRuleId.value || !rules) {
    return usedInRules.value[0]?.name || "ルール選択";
  }
  return rules[selectRuleId.value]?.name || "ルール選択";
});

const selectedRuleWeight = computed(() => {
  if (!selectRuleId.value) {
    return calculateWeight(usedInRules.value[0]?.id);
  }
  return calculateWeight(selectRuleId.value);
});

// 全体の出現割合から％を取る
const calculateWeight = (ruleId: string): number => {
  if (!currentItem.value || !omikuji || !rules) return 0;

  const rule = rules[ruleId];
  if (!rule) return 0;

  const validOmikuji = Object.values(omikuji).filter(
    (omi) => rule.enabledIds.length === 0 || rule.enabledIds.includes(omi.id)
  );

  const totalWeight = validOmikuji.reduce((sum, omi) => sum + omi.weight, 0);

  return totalWeight > 0
    ? Math.round((currentItem.value.weight / totalWeight) * 100)
    : 0;
};

// weightValuesの更新
const weightValues = computed(() => {
  // rulesが存在し、usedInRulesが空でない場合、最初のルールを使用
  if (usedInRules.value.length > 0) {
    return calculateWeight(usedInRules.value[0].id);
  }
  return 0;
});

// 更新アップデート
const updateOmikuji = () => {
  if (currentItem.value) {
    emit("update:Omiken", {
      type: "omikuji",
      update: { [currentItem.value.id]: currentItem.value },
    });
  }
};
// 子コンポーネントのOmiken更新
const updateOmiken = (payload: OmikenEntry<OmikenCategory>) =>
  emit("update:Omiken", payload);
</script>
