<!-- src/components/OmikujiEditorMessage.vue -->
<template>
  <v-card>
    <v-toolbar :color="hasNoMessages ? 'error' : 'primary'" density="compact">
      <v-toolbar-title>
        <v-icon v-if="hasNoMessages">mdi-alert-circle</v-icon>
        メッセージ設定
        <span v-if="hasNoMessages">(何も入力されてません!)</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-expansion-panels multiple>
        <v-expansion-panel
          v-for="(post, index) in editingItem.post"
          :key="index"
        >
          <v-expansion-panel-title
            :style="{ backgroundColor: getCharaColor(post.botKey) }"
          >
            <v-row no-gutters align="center">
              <v-col>
                <v-chip
                  variant="flat"
                  :color="getTypeColor(post.type)"
                  class="mr-2"
                >
                  {{ getTypeLabel(post.type) }}
                </v-chip>
                {{ post.content }}
              </v-col>
              <v-col cols="2" class="d-flex justify-end" v-if="['onecomme', 'toast'].includes(post.type)">
                <v-img
                  :src="getCharaImage(post.botKey, post.iconKey)"
                  :max-height="isHovered(post) ? 150 : 40"
                  :max-width="isHovered(post) ? 150 : 40"
                  @mouseover="hoveredImage = post"
                  @mouseleave="hoveredImage = null"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row dense>
              <v-col cols="6" sm="3">
                <v-select
                  v-model="post.type"
                  :items="onecommeTypeItems"
                  label="投稿の種類"
                  item-title="text"
                  item-value="value"
                  density="compact"
                >
                </v-select>
              </v-col>
              <v-col
                cols="6"
                sm="3"
                v-if="['onecomme', 'toast'].includes(post.type)"
              >
                <v-select
                  v-model="post.botKey"
                  :items="botKeyItems"
                  label="ボットキー"
                  item-title="text"
                  item-value="value"
                  density="compact"
                >
                </v-select>
              </v-col>
              <v-col
                cols="6"
                sm="3"
                v-if="['onecomme', 'toast'].includes(post.type)"
              >
                <v-select
                  v-model="post.iconKey"
                  :items="getIconKeyItems(post.botKey)"
                  label="アイコンキー"
                  item-title="text"
                  item-value="value"
                  density="compact"
                >
                </v-select>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model.number="post.delaySeconds"
                  label="遅延時間(秒)"
                  type="number"
                  step="0.1"
                  min="-1"
                  density="compact"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col>
                <v-text-field
                  v-model="post.content"
                  label="内容"
                  rows="2"
                  auto-grow
                  density="compact"
                >
                </v-text-field>
              </v-col>
              <v-col cols="auto">
                <v-btn block @click="removePost(index)" color="error">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
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
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    <v-card-actions>
      <v-btn
        block
        @click="addPost()"
        color="primary"
        variant="flat"
        class="mb-2"
      >
        <v-icon left>mdi-plus</v-icon> 追加
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import type { CharaStyles, OmikujiMessage } from "../types";

const props = defineProps<{
  editingItem: OmikujiMessage;
}>();

const emit = defineEmits<{
  (e: "addPost", editingItem: OmikujiMessage): void;
  (e: "removePost", editingItem: OmikujiMessage, index: number): void;
}>();

const CHARA = inject<CharaStyles>("charaKey");

// 画像を大きくするtest
const hoveredImage = ref(null);
const isHovered = (post: { botKey: string; iconKey: string }) => {
  return hoveredImage.value === post;
};

// メッセージが存在しないかどうかをチェック
const hasNoMessages = computed(() => props.editingItem.post.length === 0);

const addPost = () => emit("addPost", props.editingItem);
const removePost = (index: number) =>
  emit("removePost", props.editingItem, index);

// 型ガード関数
const isValidChara = (chara: unknown): chara is CharaStyles =>
  typeof chara === "object" && chara !== null;

// キャラクター一覧の作成
const botKeyItems = computed(() =>
  !CHARA || !isValidChara(CHARA)
    ? []
    : Object.keys(CHARA).map((key) => ({
        text: CHARA[key].name,
        value: key,
      }))
);

const getIconKeyItems = (botKey: string | undefined) =>
  !botKey || !CHARA || !isValidChara(CHARA) || !(botKey in CHARA)
    ? []
    : Object.keys(CHARA[botKey].image).map((key) => ({
        text: key,
        value: key,
      }));

// キャラクターの背景色を取得する関数
const getCharaColor = (botKey: string | undefined) =>
  botKey && CHARA && CHARA[botKey]
    ? CHARA[botKey].color["--lcv-background-color"]
    : "";

// キャラクターの画像を取得する関数
const getCharaImage = (
  botKey: string | undefined,
  iconKey: string | undefined
) => {
  if (botKey && CHARA && CHARA[botKey] && iconKey) {
    // 画像パスを明示的に指定
    return `/img/${CHARA[botKey].image[iconKey]}`;
  }
  return "";
};

// 投稿タイプに応じた色を取得する関数
const getTypeColor = (type: string) => {
  switch (type) {
    case "onecomme":
      return "orange";
    case "party":
      return "deep-orange";
    case "toast":
      return "blue";
    case "speech":
      return "green";
    default:
      return "grey";
  }
};

// 投稿タイプに応じたラベルを取得する関数
const getTypeLabel = (type: string) => {
  switch (type) {
    case "onecomme":
      return "わんコメ";
    case "party":
      return "WordParty";
    case "toast":
      return "トースト";
    case "speech":
      return "スピーチ";
    default:
      return type;
  }
};

const onecommeTypeItems = [
  { text: "わんコメ", value: "onecomme" },
  { text: "WordParty", value: "party" },
  { text: "トースト", value: "toast" },
  { text: "スピーチ", value: "speech" },
];
</script>
