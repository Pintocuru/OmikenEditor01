// src/types/editor.ts
import {
  ListTypeMap,
  ListItemTypeMap,
  OmikenType,
  CharaType,
  PresetType,
} from "./index";

// エディター用型定義

// AppEditer
export interface AppEditerType {
  Omiken: OmikenType;
  Presets: Record<string, OmikenType>; // preset:Omiken
  Charas: Record<string, CharaType>; // preset:Chara
  Scripts: Record<string, PresetType>; // preset:Script
}


// メインカテゴリーの型
export type CategoryMain = "rules" | "omikujis" | "places" | "presets";
export type CategorySub = {
  rules: "comment" | "timer" | "meta" | "waitingList" | "setList" | "reactions";
  omikujis: never; // サブカテゴリーなし
  places: never; // サブカテゴリーなし
  presets: "Omiken" | "Chara" | "Script";
};
export type CategoryActive<T extends CategoryMain = CategoryMain> = {
  main: T; // 現在選択されているメインカテゴリー
  sub?: CategorySub[T]; // メインカテゴリーに対応するサブカテゴリー（オプショナル）
};


// リスト用カテゴリー
export type ListCategory = "rules" | "omikujis" | "places";
export type ItemCategory = "rule" | "omikuji" | "place";
export type ListType = ListTypeMap[ListCategory];
export type ListEntry<T extends ListCategory> = {
  isOpen: boolean; // ダイアログの開閉状態
  type: T;
  mode: string | null; // 表示モード
  key: string | string[] | null;
};
// listEntry全体の型
export type ListEntryCollect = {
  [K in ListCategory]: ListEntry<K>;
};

// ファイル操作用
export type OmikenCategory = ListCategory | "preset";
export type OmikenEntry<T extends OmikenCategory> = T extends ListCategory
  ? {
      type: T;
      update?: T extends ListCategory ? ListItemTypeMap[T] : never;
      addKeys?: T extends "omikujis"
        ? OmikujisAddItem
        : PartialListItem<T> | PartialListItem<T>[];
      delKeys?: string | string[];
      reorder?: string[];
      preset?: T extends "preset" ? OmikenType : never;
    }
  : null;

// addItem用のPartial型(一部のキーだけでデータを作成できる)
type PartialListItem<T extends ListCategory> = Partial<ListTypeMap[T]>;

// OmikujisはrulesのIDが必須
type OmikujisAddItem = 
  | (PartialListItem<"omikujis"> & { rulesId?: string })
  | (PartialListItem<"omikujis"> & { rulesId?: string })[];


// おみくじデータ付きpresetデータ
export interface PresetOmikenType extends PresetType {
  item: OmikenType;
  mode?: "overwrite" | "append"; // 追加方法(上書き/追加)
}