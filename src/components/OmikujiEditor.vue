<!-- src/components/OmikujiEditor.vue -->
<template>
  <v-container v-if="editingItem">
    <v-card-text>
      <v-form @submit.prevent="editingItem">
        <!-- おみくじの基本情報 -->
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="editingItem.name" label="結果名">
              <v-tooltip activator="parent" location="bottom"
                >おみくじの結果の名称（ラベル）を入力してください。<br />
                例: 「大吉」「中吉」「小吉」など。</v-tooltip
              >
            </v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" sm="2">
            <v-text-field
              v-model.number="editingItem.weight"
              label="出現比"
              type="number"
              min="0"
              max="100"
            >
              <v-tooltip activator="parent" location="bottom"
                >ランダムに偏りをつける</v-tooltip
              >
            </v-text-field>
          </v-col>
          <v-col align-self="center">
            <v-progress-linear
              :model-value="sumWeightValues(editingItem.weight)"
              buffer-value="10"
              color="primary"
              height="35"
              striped
              >出現割合：{{
                sumWeightValues(editingItem.weight)
              }}
              %</v-progress-linear
            >
          </v-col>
        </v-row>

        <!-- フィルタリング基準の設定 -->
        <v-card>
          <v-toolbar color="primary" density="compact">
            <v-toolbar-title>フィルタリング設定</v-toolbar-title>
          </v-toolbar>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-select
                v-bind="props"
                v-model="editingItem.threshold.type"
                :items="thresholdTypes"
                item-title="text"
                item-value="value"
                label="フィルタリング基準"
              ></v-select>
            </template>
            <span>適用外の場合は抽選の対象にならない基準を設定します。</span>
          </v-tooltip>

          <v-row v-if="editingItem.threshold.type !== 'none'" class="auto">
            <v-col cols="12" sm="4">
              <v-select
                v-model="editingItem.threshold.comparison"
                :items="comparisonItems"
                item-title="text"
                item-value="value"
                label="比較方法"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="editingItem.threshold.value"
                label="基準値"
                type="number"
                min="0"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              sm="4"
              v-if="editingItem.threshold.comparison === 'range'"
            >
              <v-text-field
                v-model.number="editingItem.threshold.valueMax"
                label="基準値(最大)"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card>

        <!-- メッセージタイプごとの設定 -->
        <v-card>
          <v-toolbar
            :color="hasNoMessages ? 'error' : 'primary'"
            density="compact"
          >
            <v-toolbar-title
              ><span v-if="hasNoMessages"
                ><v-icon>mdi-alert-circle</v-icon></span
              >メッセージ設定
              <span v-if="hasNoMessages"
                >(何も入力されてません!)</span
              ></v-toolbar-title
            >
          </v-toolbar>
          <v-tabs v-model="activeTab">
            <v-tab v-for="type in messageTypes" :key="type" :value="type">
              {{ type }} ({{ editingItem[type]?.length || 0 }})
            </v-tab>
          </v-tabs>
          <v-window v-model="activeTab">
            <v-window-item
              v-for="type in messageTypes"
              :key="type"
              :value="type"
            >
              <v-row
                v-for="(post, index) in editingItem[type]"
                :key="index"
                no-gutters
                class="mt-4"
              >
                <v-col cols="11">
                  <v-row dense>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
                      v-if="['message', 'toast'].includes(type)"
                    >
                      <v-select
                        v-model="post.botKey"
                        :items="botKeyItems"
                        label="ボットキー"
                        item-title="text"
                        item-value="value"
                        density="compact"
                      >
                        <v-tooltip activator="parent" location="bottom"
                          >喋らせるキャラクター</v-tooltip
                        >
                      </v-select>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
                      v-if="['message', 'toast'].includes(type)"
                    >
                      <v-select
                        v-model="post.iconKey"
                        :items="getIconKeyItems(post.botKey)"
                        label="アイコンキー"
                        item-title="text"
                        item-value="value"
                        density="compact"
                      >
                        <v-tooltip activator="parent" location="bottom"
                          >表示させるキャラクターの画像(アイコン)</v-tooltip
                        >
                      </v-select>
                    </v-col>
                    <v-col cols="12" sm="4" md="2">
                      <v-text-field
                        v-model.number="post.delaySeconds"
                        label="遅延時間(秒)"
                        type="number"
                        step="0.1"
                        min="-1"
                        density="compact"
                      >
                        <v-tooltip activator="parent" location="bottom"
                          >投稿してから喋らせるまでの遅延時間</v-tooltip
                        >
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                        v-model="post.content"
                        label="内容"
                        rows="2"
                        auto-grow
                        density="compact"
                      >
                        <v-tooltip activator="parent" location="bottom"
                          >喋らせる内容。プレースホルダーが使えます。</v-tooltip
                        >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="1" class="d-flex align-center justify-center">
                  <v-btn
                    block
                    @click="removePost(editingItem, type, index)"
                    color="error"
                    icon="mdi-delete"
                    size="small"
                  ></v-btn>
                </v-col>
                <v-col cols="12">
                  <v-slider
                    v-model.number="post.delaySeconds"
                      prepend-icon="mdi-alarm"
                      :thumb-size="24"
                      thumb-label="always"
                    class="pa-2"
                    min="-1"
                    max="10"
                    step="0.1"
                  />
                </v-col>
              </v-row>
              <v-btn
                block
                @click="addPost(editingItem, type)"
                color="primary"
                class="mb-2"
              >
                <v-icon>mdi-plus</v-icon> 追加
              </v-btn>
            </v-window-item>
          </v-window>
        </v-card>
      </v-form>
    </v-card-text>
  </v-container>
  <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import type { CharaStyles, DefaultState, OmikujiMessage, Post } from "../types";
import { SelectedItem } from "@/AppTypes";
import {
  useEditOmikuji,
  useItemEditor,
} from "../composables/funkOmikenEdit.js";

// props/emits
const props = defineProps<{
  STATE: DefaultState;
  selectedItem: SelectedItem;
}>();

const emit = defineEmits<{
  (e: "update:item", value: OmikujiMessage): void;
}>();

// キャラクターデータ
const CHARA = inject<CharaStyles>("charaKey");

// 更新のコンポーザブル
const { editingItem } = useItemEditor(props, emit);

// useOmikujiEditorコンポーザブルの使用
const {
  addPost,
  messageTypes,
  thresholdTypes,
  comparisonItems,
  removePost,
  sanitizeThresholdSettings,
  sumWeightValues,
} = useEditOmikuji(props.STATE, CHARA);

// フィルタリング設定が変更されたときに自動的にバリデーションを実行
watch(
  () => editingItem.value?.threshold,
  () => {
    if (editingItem.value && editingItem.value.threshold) {
      const wasModified = sanitizeThresholdSettings(editingItem);
      if (wasModified) {
        // ここでユーザーに通知を表示するなどの処理を行う
        console.log("Threshold settings were automatically adjusted");
      }
    }
  },
  { deep: true }
);

const activeTab = ref("message");

// 型ガード関数
function isValidChara(chara: unknown): chara is CharaStyles {
  return typeof chara === "object" && chara !== null;
}

const botKeyItems = computed(() => {
  console.log("CHARA:", CHARA); // CHARAの内容をログ出力
  if (!CHARA || !isValidChara(CHARA)) return [];
  const items = Object.keys(CHARA).map((key) => ({
    text: CHARA[key].name,
    value: key,
  }));
  console.log("botKeyItems:", items); // 生成されたitemsをログ出力
  return items;
});

const getIconKeyItems = (botKey: string | undefined) => {
  if (!botKey) return [];
  console.log("getIconKeyItems called with botKey:", botKey); // botKeyの値をログ出力
  if (!CHARA || !isValidChara(CHARA) || !botKey || !(botKey in CHARA))
    return [];
  const botChara = CHARA[botKey];
  const items = Object.keys(botChara.image).map((key) => ({
    text: key,
    value: key,
  }));
  return items;
};

// 何のデータもないときに警告する
const hasNoMessages = computed(() => {
  return ["message", "party", "toast", "speech"].every(
    (type) => !editingItem.value[type] || editingItem.value[type].length === 0
  );
});
</script>
