// src/types/preset.ts
import { BaseType, OneCommePostType } from './Omiken';
import { visitDataType, GameType } from './plugin';
import { RGBColor } from '@onecomme.com/onesdk/types/Color';
import { Comment } from '@onecomme.com/onesdk/types/Comment';

// presetデータ
export interface PresetType extends BaseType {
 type: 'Omiken' | 'Chara' | 'Script';
 path?: string; // データのパス(Presetsをルートとする)
 banner?: string;
 mode?: 'overwrite' | 'append'; // 追加方法(上書き/追加)
}

// ---

// Chara:キャラクターJSONの型定義
export interface CharaType extends BaseType {
 nickname?: string; // 読み上げ時の名前の読ませ方
 frameId: string | null; // わんコメの枠
 serviceColor: RGBColor; // 枠情報の色{b:number,g:number,r:number,}
 color: {
  '--lcv-name-color': string; // 名前の色
  '--lcv-text-color': string; // コメントの色
  '--lcv-background-color': string; // 背景色
  '--lcv-background-brightness'?: string; // 背景色の明度(ジェネレーター用)
  '--lcv-background-opacity'?: string; // 背景色の不透明度(ジェネレーター用)
 };
 image: {
  Default: string; // defaultは必須
  [key: string]: string; // 追加のキーに対応
 };
 party: string[]; // キャラクター表示時、WordPartyを発動させるキー群
}

// ---

export interface ScriptsType {
 func: (visit: visitDataType, game: GameType, comment?: Comment, params?: ScriptParam[]) => ScriptsReturnType;
 scriptParams: ScriptParam[];
 placeholders: ScriptParam[];
}

// Script全体の型定義
export type ScriptsParamType = (
 visit: visitDataType,
 game: GameType,
 comment?: Comment,
 params?: ScriptParam[]
) => ScriptsReturnType;

// Scriptの返り値
export interface ScriptsReturnType {
 postArray?: OneCommePostType[];
 placeholder: { [id: string]: string | number };
 game: GameType;
 visitData: visitDataType;
}

// gameのパラメータ設定用
export interface ScriptParam extends BaseType {
 value: string; // 入る値
}
