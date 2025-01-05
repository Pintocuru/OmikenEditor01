// src/types/Omiken.ts

import {
 baseSchema,
 OmikenSchema,
 TypesTypeSchema,
 OneCommePostSchema,
 thresholdSchema,
 ruleSchema,
 omikujiSchema,
 placeSchema
} from './OmikenSchemas';
import { z } from 'zod';

///////////////////////////////////
// Omiken
///////////////////////////////////

// Omiken:おみくじ&初見判定ちゃんBOT用型定義
export type OmikenType = {
 types: Record<TypesType, string[]>;
 rules: Record<string, RulesType>; // おみくじルール
 omikujis: Record<string, OmikujiType>; // おみくじ
 places: Record<string, PlaceType>; // プレースホルダー
};

// コンテンツの型マッピング
export type OmikenTypeMap = {
 types: string[];
 rules: RulesType;
 omikujis: OmikujiType;
 places: PlaceType;
};

// types
export type TypesType = z.infer<typeof TypesTypeSchema>;

// BaseType:基本となる項目
export type BaseType = z.infer<typeof baseSchema>;

// rules:おみくじルールの型定義
export type RulesType = z.infer<typeof ruleSchema>;

// omikujis:おみくじの型定義
export type OmikujiType = z.infer<typeof omikujiSchema>;
// わんコメに渡す投稿情報
export type OneCommePostType = z.infer<typeof OneCommePostSchema>;

// places:プレースホルダーの型定義
export type PlaceType = z.infer<typeof placeSchema>;
export type PlaceValueType = z.infer<typeof placeSchema>['values'][number];

// Threshold(rules,omikuji)の条件型
export type ThresholdType = z.infer<typeof thresholdSchema>;
export type ConditionType = z.infer<typeof thresholdSchema>['conditionType'];
export type CountCondition = z.infer<typeof thresholdSchema>['count'];
export type MatchCondition = z.infer<typeof thresholdSchema>['match'];
