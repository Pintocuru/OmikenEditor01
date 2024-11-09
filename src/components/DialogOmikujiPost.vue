<!-- src/components/DialogOmikujiPost.vue -->
<template>
  <v-card>
    <v-toolbar :color="currentItem.post.length === 0 ? 'error' : themeColor" density="compact" class="mb-2">
      <v-toolbar-title>
        <v-icon v-if="currentItem.post.length === 0">mdi-alert-circle</v-icon>
        メッセージ設定
        <span v-if="currentItem.post.length === 0">(何も入力されてません!)</span>
      </v-toolbar-title>
      <template #append>
        <v-btn block @click="addPost('top')" variant="outlined">
          <v-icon>mdi-plus</v-icon> 追加
        </v-btn>
      </template>
    </v-toolbar>
    <v-expansion-panels multiple>
      <v-expansion-panel v-for="(post, index) in currentItem.post" :key="index">
        <v-expansion-panel-title hide-actions :color="getPostColor(post)">
          <v-toolbar density="compact" color="transparent">
            <v-chip variant="flat" :color="getTypeColor(post.type)">
              {{ getTypeLabel(post.type) }}
            </v-chip>

            <v-img v-if="isCharacterPost(post.type)" :src="getCharaImage(post)" max-height="80" max-width="80"  class="ml-2" />

            <v-toolbar-title>
              {{ post.content }}
            </v-toolbar-title>

            <v-chip variant="flat" color="while">
              <v-icon class="mr-2">mdi-clock-outline</v-icon>
              <span class="font-weight-bold">{{ post.delaySeconds }}秒</span>
            </v-chip>
          </v-toolbar>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row dense>
            <v-col cols="6" sm="3">
              <v-select v-model="post.type" :items="onecommeTypeItems" label="投稿の種類" item-title="text"
                item-value="value" density="compact" @update:modelValue="updateOmikenOmikuji">
              </v-select>
            </v-col>
            <v-col cols="6" sm="3" v-if="isCharacterPost(post.type)">
              <v-select v-model="post.botKey" :items="botKeyItems" label="ボットキー" item-title="text" item-value="value"
                density="compact" @update:modelValue="updateOmikenOmikuji">
              </v-select>
            </v-col>
            <v-col cols="6" sm="3" v-if="isCharacterPost(post.type)">
              <v-select v-model="post.iconKey" :items="getIconKeyItems(post.botKey)" label="アイコンキー" item-title="text"
                item-value="value" density="compact" @update:modelValue="updateOmikenOmikuji">
              </v-select>
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field v-model.number="post.delaySeconds" label="遅延時間(秒)" type="number" step="0.1" min="-1"
                density="compact" @input="updateOmikenOmikuji">
              </v-text-field>
            </v-col>
          </v-row>
          <v-sheet>
            <v-text-field v-model="post.content" label="内容" rows="2" auto-grow @input="updateOmikenOmikuji" />

            <v-slider v-model.number="post.delaySeconds" prepend-icon="mdi-alarm" :thumb-size="24" thumb-label="always"
              class="pa-2" min="-1" max="10" step="0.1" @update:modelValue="updateOmikenOmikuji" />
          </v-sheet>

          <v-sheet class="d-flex justify-space-between align-center">
            <v-tooltip v-for="(name, index) in extractValidPlaceholders(post.content)
              .validPlaceholders" :key="index" text="クリックでエディターを開く" location="bottom">
              <template v-slot:activator="{ props: tooltipProps }">
                <v-chip v-bind="tooltipProps" class="me-2" color="primary" variant="outlined" @click="
                  openEditorItem('place',
                    extractValidPlaceholders(post.content).placeholderIds[
                    index
                    ]
                  )
                  ">
                  {{ name }}
                </v-chip>
              </template>
            </v-tooltip>
            <!-- 複製・削除ボタン -->
            <PartsArrayRemove :type="'omikuji'" :currentItem="currentItem" :array="currentItem.post" :index="index"
              @update:Omiken="updateOmiken" />
          </v-sheet>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-card-actions>
      <v-btn block @click="addPost()" color="primary" variant="flat" class="mb-2">
        <v-icon left>mdi-plus</v-icon> 追加
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { inject, Ref } from "vue";
import type {
  AppStateType,
  ListCategory,
  ListEntry,
  OmikujiType,
  OmikenCategory,
  OmikenEntry,
  OmikujiPostType,
} from "../types";
import { FunkOmikuji } from "../composables/FunkOmikuji";
import PartsArrayRemove from "../components/common/PartsArrayRemove.vue";
import { FunkEmits } from "@/composables/FunkEmits";
const props = defineProps<{
  currentItem: OmikujiType;
  themeColor: string;
}>();

const emit = defineEmits<{
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
  (e: "open-editor", editorItem: ListEntry<ListCategory>): void;
}>();

// inject
const AppState = inject<Ref<AppStateType>>("AppStateKey");
const CHARA = AppState?.value.CHARA;

// コンポーザブル:FunkEmits
const { updateOmiken, openEditorItem } = FunkEmits(emit);

const {
  // Post type utilities
  getTypeColor,
  getTypeLabel,
  onecommeTypeItems,
  isCharacterPost,
  getPostColor,

  // Character utilities
  botKeyItems,
  getIconKeyItems,
  getCharaImage,

  extractValidPlaceholders,
} = FunkOmikuji();

// 更新アップデート
const updateOmikenOmikuji = () => {
  if (props.currentItem) {
    emit("update:Omiken", {
      type: "omikuji",
      update: { [props.currentItem.id]: props.currentItem },
    });
  }
};

// postに追加
const addPost = (position = "bottom") => {
  const botKey = CHARA ? Object.keys(CHARA)[0] : "mamono";
  const newPost: OmikujiPostType = {
    type: "onecomme",
    botKey: botKey,
    iconKey: "Default",
    delaySeconds: 0,
    content: "<<user>>の新しいメッセージ",
  };

  if (position === "top") {
    props.currentItem.post.unshift(newPost);
  } else {
    props.currentItem.post.push(newPost);
  }

  updateOmikenOmikuji();
};

</script>
