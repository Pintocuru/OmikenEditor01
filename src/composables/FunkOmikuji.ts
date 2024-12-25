// src/composables/FunkOmikuji.ts

import { AppEditorType, OneCommePostType } from "@/types/index";
import { computed, inject, Ref } from "vue";

export function FunkOmikuji() {
  // Inject
  const AppEditor = inject<Ref<AppEditorType>>("AppEditorKey");
  const Chara = AppEditor?.value.Charas;
  const place = AppEditor?.value.Omiken.places;

  const POST_TYPES: Record<PostTypeKey, { color: string; label: string }> = {
    onecomme: { color: "orange", label: "わんコメ" },
    party: { color: "deep-orange", label: "WordParty" },
    toast: { color: "blue", label: "トースト" },
    speech: { color: "green", label: "スピーチ" },
  };

  // 投稿タイプに応じた色を取得する関数
  type PostTypeKey = "onecomme" | "party" | "toast" | "speech";
  const getTypeColor = (type: PostTypeKey): string =>
    POST_TYPES[type]?.color || "grey";
  const getTypeLabel = (type: PostTypeKey): string =>
    POST_TYPES[type]?.label || type;

  const onecommeTypeItems = Object.entries(POST_TYPES).map(
    ([value, { label }]) => ({
      text: label,
      value,
    })
  );

  // キャラクター関連の投稿タイプかどうかを判定
  const isCharacterPost = (type: string): boolean =>
    ["onecomme", "toast"].includes(type);

  // ポストの色を取得
  const getPostColor = (post: OneCommePostType): string => {
    return isCharacterPost(post.type) ? getCharaColor(post.botKey) : "";
  };

  // キャラクター一覧の作成
  const botKeyItems = computed(() => {
    if (!Chara || typeof Chara !== "object") return [];
    return Object.entries(Chara).map(([key, value]) => ({
      text: value.name,
      value: key,
    }));
  });

  // postからonecommeを探し色を取得する
  const getPostTypeColor = (
    post: OneCommePostType[],
    isBotColor?: boolean
  ): string => {
    const onecommePost = post.find((p) => p.type === "onecomme");
    if (onecommePost?.botKey && isBotColor) {
      return getCharaColor(onecommePost.botKey) ?? "grey";
    }

    // 'onecomme'がなければ、最初のtypeを判断して色を返す
    const firstPost = post[0];
    switch (firstPost.type) {
      case "party":
        return "deep-orange";
      case "speech":
        return "green";
      default:
        return "";
    }
  };

  // アイコンキーアイテムの取得
  const getIconKeyItems = (botKey: string | undefined) => {
    if (!botKey || !Chara || !(botKey in Chara)) return [];
    return Object.keys(Chara[botKey].image).map((key) => ({
      text: key,
      value: key,
    }));
  };

  // キャラクターの背景色を取得する関数
  const getCharaColor = (botKey: string | undefined): string => {
    if (!botKey || !Chara || !Chara[botKey]) return "";
    return Chara[botKey].color["--lcv-background-color"];
  };

  // キャラクターの画像を取得する関数
  const getCharaImage = (post: OneCommePostType): string => {
    if (!post.botKey || !post.iconKey || !Chara || !Chara[post.botKey])
      return "";
    return `/img/${Chara[post.botKey].image[post.iconKey]}`;
  };

  //---

  // プレースホルダーから使用しているidを返す
  const extractValidPlaceholders = (content: string) => {
    if (!content || !place) {
      return {
        validPlaceholders: [],
        placeholderIds: [],
      };
    }

    const matches = content.match(/<<(.*?)>>/g);
    if (!matches) {
      return {
        validPlaceholders: [
          "ここに使用している有効なプレースホルダーが表示されます",
        ],
        placeholderIds: [],
      };
    }

    const placeholderNames = [
      ...new Set(matches.map((match) => match.replace(/^<<|>>$/g, ""))),
    ];

    const validPlaceholders: string[] = [];
    const placeholderIds: string[] = [];

    Object.entries(place).forEach(([id, placeData]) => {
      if (placeholderNames.includes(placeData.name)) {
        validPlaceholders.push(placeData.name);
        placeholderIds.push(id);
      }
    });

    return {
      validPlaceholders:
        validPlaceholders.length > 0
          ? validPlaceholders
          : ["ここに使用している有効なプレースホルダーが表示されます"],
      placeholderIds,
    };
  };

  // onecommeのcontentを取得
  const getOnecommeContent = (posts: OneCommePostType[]): string => {
    const onecommePost = posts.find((p) => p.type === "onecomme");
    return onecommePost?.content ?? "";
  };

  return {
    // Post type utilities
    getTypeColor,
    getPostTypeColor,
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

    getOnecommeContent,
  };
}
