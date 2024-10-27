<!-- src/components/DialogOmikujiPost.vue -->
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
          v-for="(post, index) in currentItem.post"
          :key="index"
        >
          <v-expansion-panel-title
            hide-actions
            :color="
              ['onecomme', 'toast'].includes(post.type)
                ? getCharaColor(post.botKey)
                : ''
            "
          >
            <v-toolbar flat color="transparent">
              <!-- 左側のコンテンツ -->
              <v-chip
                variant="flat"
                :color="getTypeColor(post.type)"
                class="mr-2"
              >
                {{ getTypeLabel(post.type) }}
              </v-chip>

              <v-img
                v-if="['onecomme', 'toast'].includes(post.type)"
                :src="getCharaImage(post.botKey ?? '', post.iconKey ?? '')"
                max-height="80"
                max-width="80"
              />

              <v-toolbar-title>
                {{ replacePlaceholder(post.content) }}
              </v-toolbar-title>

              <v-chip variant="flat" color="while" class="mr-2">
                <v-icon class="mr-2">mdi-clock-outline</v-icon>
                <span class="font-weight-bold">{{ post.delaySeconds }}秒</span>
              </v-chip>
            </v-toolbar>
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
                  @change="updateOmikuji"
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
                  @change="updateOmikuji"
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
                  @change="updateOmikuji"
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
                  @input="updateOmikuji"
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
                  @input="updateOmikuji"
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
                  @change="updateOmikuji"
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
import { computed, inject, Ref, ref } from "vue";
import type {
  AppStateType,
  CHARAType,
  ListCategory,
  ListEntry,
  OmikujiType,
  OmikujiPostType,
  STATECategory,
  STATEEntry,
} from "../types";
import _ from "lodash";
const props = defineProps<{
  currentItem: OmikujiType;
}>();

const emit = defineEmits<{
  (e: "update:STATE", payload: STATEEntry<STATECategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const CHARA = AppState?.value.CHARA;
const place = AppState?.value.STATE.place;

// メッセージが存在しないかどうかをチェック
const hasNoMessages = computed(() => props.currentItem.post.length === 0);

// postに追加
const addPost = () => {
  const item = props.currentItem;
  // キャラクターキーを取得
  const botKey = CHARA ? Object.keys(CHARA)[0] : "mamono";
  // ポストを追加
  (item.post as OmikujiPostType[]).push({
    type: "onecomme",
    botKey: botKey,
    iconKey: "Default",
    delaySeconds: 0,
    content: "<<user>>さんの運勢は【大吉】",
  });
  // 状態を更新
  emit("update:STATE", {
    type: "omikuji",
    update: { [item.id]: item },
  });
};

const removePost = (index: number) => {
  const item = props.currentItem;
  // ポストを削除
  (item.post as OmikujiPostType[])?.splice(index, 1);
  // 状態を更新
  emit("update:STATE", {
    type: "omikuji",
    update: { [item.id]: item },
  });
};

// 更新アップデート
const updateOmikuji = () => {
  if (props.currentItem) {
    emit("update:STATE", {
      type: "omikuji",
      update: { [props.currentItem.id]: props.currentItem },
    });
  }
};

// 型ガード関数
const isValidChara = (chara: unknown): chara is CHARAType => {
  if (typeof chara !== "object" || chara === null) {
    console.error("無効なキャラクター:", chara);
    return false;
  }
  return true;
};

// キャラクター一覧の作成
const botKeyItems = computed(() => {
  try {
    if (!CHARA || !isValidChara(CHARA)) {
      console.warn("CHARAが無効です");
      return [];
    }
    return Object.keys(CHARA).map((key) => ({
      text: CHARA[key].name,
      value: key,
    }));
  } catch (error) {
    console.error("キャラクター一覧の作成中にエラーが発生しました:", error);
    return [];
  }
});

// アイコンキーアイテムの取得
const getIconKeyItems = (botKey: string | undefined) => {
  try {
    if (!botKey || !CHARA || !isValidChara(CHARA) || !(botKey in CHARA)) {
      console.warn("無効なボットキーまたはCHARA:", { botKey, CHARA });
      return [];
    }
    return Object.keys(CHARA[botKey].image).map((key) => ({
      text: key,
      value: key,
    }));
  } catch (error) {
    console.error("アイコンキーアイテムの取得中にエラーが発生しました:", error);
    return [];
  }
};

// キャラクターの背景色を取得する関数
const getCharaColor = (botKey: string | undefined): string => {
  try {
    // CHARAが存在し、値が取得できるかを確認
    if (botKey && CHARA && CHARA[botKey]) {
      return CHARA[botKey].color["--lcv-background-color"];
    }
    console.warn("無効なボットキーまたはCHARA:", { botKey, CHARA });
    return "";
  } catch (error) {
    console.error("キャラクターの背景色取得中にエラーが発生しました:", error);
    return "";
  }
};

// キャラクターの画像を取得する関数
const getCharaImage = (
  botKey: string | undefined,
  iconKey: string | undefined
): string => {
  try {
    // CHARA.valueを使用してアクセス
    if (botKey && CHARA && CHARA[botKey] && iconKey) {
      // 画像パスを明示的に指定
      return `/img/${CHARA[botKey].image[iconKey]}`;
    }
    console.warn("無効なボットキーまたはアイコンキー:", {
      botKey,
      iconKey,
      CHARA,
    });
    return "";
  } catch (error) {
    console.error("キャラクターの画像取得中にエラーが発生しました:", error);
    return "";
  }
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

// place を使ってプレースホルダーを置き換え
const replacePlaceholder = (content: string): string => {
  if (!place) return content;

  // プレースホルダーの形式を <<...>> に変更
  return content.replace(/<<(.*?)>>/g, (_, name) => {
    // 新しいplace構造に基づいてフィルタリング
    const matchedPlaceholders = Object.values(place).filter(
      (ph) => ph.name === `<<${name}>>`
    );

    if (matchedPlaceholders.length > 0) {
      const randomPlaceholder =
        matchedPlaceholders[
          Math.floor(Math.random() * matchedPlaceholders.length)
        ];
      return randomPlaceholder.content;
    }

    return `<<${name}>>`; // プレースホルダーが見つからなかった場合はそのまま表示
  });
};
</script>
