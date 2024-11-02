// src/composables/FunkOmikuji.ts

import { AppStateType, OmikujiPostType } from "@/types";
import { computed, inject, Ref } from "vue";


export function FunkOmikuji() {

  // Inject
  const AppState = inject<Ref<AppStateType>>("AppStateKey");
  const CHARA = AppState?.value.CHARA;
  const place = AppState?.value.Omiken.place;


  const POST_TYPES: Record<PostTypeKey, { color: string; label: string }> = {
    onecomme: { color: "orange", label: "わんコメ" },
    party: { color: "deep-orange", label: "WordParty" },
    toast: { color: "blue", label: "トースト" },
    speech: { color: "green", label: "スピーチ" }
  };
  // 投稿タイプに応じた色を取得する関数
  type PostTypeKey = 'onecomme' | 'party' | 'toast' | 'speech';
  const getTypeColor = (type: PostTypeKey): string => POST_TYPES[type]?.color || "grey";
  const getTypeLabel = (type: PostTypeKey): string => POST_TYPES[type]?.label || type;

  const onecommeTypeItems = Object.entries(POST_TYPES).map(([value, { label }]) => ({
    text: label,
    value
  }));

  // キャラクター関連の投稿タイプかどうかを判定
  const isCharacterPost = (type: string): boolean => ["onecomme", "toast"].includes(type);

  // ポストの色を取得
  const getPostColor = (post: OmikujiPostType): string => {
    return isCharacterPost(post.type) ? getCharaColor(post.botKey) : "";
  };

  // キャラクター一覧の作成
  const botKeyItems = computed(() => {
    if (!CHARA || typeof CHARA !== "object") return [];
    return Object.entries(CHARA).map(([key, value]) => ({
      text: value.name,
      value: key,
    }));
  });

  // アイコンキーアイテムの取得
  const getIconKeyItems = (botKey: string | undefined) => {
    if (!botKey || !CHARA || !(botKey in CHARA)) return [];
    return Object.keys(CHARA[botKey].item.image).map(key => ({
      text: key,
      value: key,
    }));
  };

  // キャラクターの背景色を取得する関数
  const getCharaColor = (botKey: string | undefined): string => {
    if (!botKey || !CHARA || !CHARA[botKey]) return "";
    return CHARA[botKey].item.color["--lcv-background-color"];
  };

  // キャラクターの画像を取得する関数
  const getCharaImage = (post: OmikujiPostType): string => {
    if (!post.botKey || !post.iconKey || !CHARA || !CHARA[post.botKey]) return "";
    return `/img/${CHARA[post.botKey].item.image[post.iconKey]}`;
  };

  //---

  // プレースホルダーから使用しているidを返す
  const extractValidPlaceholders = (content: string) => {
    if (!content || !place) {
      return {
        validPlaceholders: [],
        placeholderIds: []
      };
    }

    const matches = content.match(/<<(.*?)>>/g);
    if (!matches) {
      return {
        validPlaceholders: ["ここに使用している有効なプレースホルダーが表示されます"],
        placeholderIds: []
      };
    }

    const placeholderNames = [...new Set(
      matches.map(match => match.replace(/^<<|>>$/g, ''))
    )];

    const validPlaceholders: string[] = [];
    const placeholderIds: string[] = [];

    Object.entries(place).forEach(([id, placeData]) => {
      if (placeholderNames.includes(placeData.name)) {
        validPlaceholders.push(placeData.name);
        placeholderIds.push(id);
      }
    });

    return {
      validPlaceholders: validPlaceholders.length > 0 ? validPlaceholders : ["ここに使用している有効なプレースホルダーが表示されます"],
      placeholderIds
    };
  };

  return {
    // Post type utilities
    getTypeColor,
    getTypeLabel,
    onecommeTypeItems,
    isCharacterPost,
    getPostColor,

    // Character utilities
    botKeyItems,
    getIconKeyItems,
    getCharaColor,
    getCharaImage,

    // Placeholder utilities
    extractValidPlaceholders,
  };
}
