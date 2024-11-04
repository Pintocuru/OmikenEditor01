// src/composables/funkRules.ts

import { computed, Ref } from "vue";
import { OmikujiType, RulesType } from "@/types";

export function funkRules(omikuji: Record<string, OmikujiType>) {
  // 定数
  const SWITCH_CONFIG = {
    labels: ["無効", "だれでも", "メンバー", "モデレーター", "管理者"],
    colors: ["", "yellow", "green", "blue", "red"],
  };

  const WEIGHT_THRESHOLDS = [
    { threshold: 80, color: "red" },
    { threshold: 60, color: "yellow" },
    { threshold: 40, color: "green" },
    { threshold: 20, color: "cyan" },
    { threshold: 1, color: "blue" },
  ];

  // switch名とカラーの取得
  const getSwitchLabel = (switchValue: number) =>
    SWITCH_CONFIG.labels[switchValue] || "Unknown";
  const getSwitchColor = (switchValue: number) =>
    SWITCH_CONFIG.colors[switchValue] || "";

  // omikujiのリスト
  const omikujiLists = computed(() => {

    // omikujiOrderがない場合は従来の方法で並び替え
    return Object.entries(omikuji || {}).map(([id, omikuji]) => ({
      id,
      name: omikuji.name,
      weight: omikuji.weight,
    }));
  });

  // 有効なomikujiのリスト
  const enabledOmikujiLists = computed(() => {
    const enabledIds: string | string[] = [];
    const isAllEnabled = enabledIds.length === 0;

    if (isAllEnabled) {
      return omikujiLists.value;
    }
    return omikujiLists.value.filter((option) => enabledIds.includes(option.id));
  });

  const chipColors = (enabledIds: string[]) => {
    return Object.keys(omikuji).map((id) => ({
      id,
      color: weightColor(id, enabledIds),
    }));
  };

  // weight合計を計算
  const weightTotal = (enabledIds: string[]): number => {
    return enabledIds.reduce((sum, id) => sum + (omikuji[id]?.weight ?? 0), 0);
  };

  // totalWeightの割合を計算
  const weightPercentage = (optionId: string, enabledIds: string[]): number => {
    const weight = omikuji[optionId]?.weight ?? 0;
    const total = weightTotal(enabledIds);
    return total > 0 ? parseFloat(((weight / total) * 100).toFixed(1)) : 0;
  };

  // v-chipに色を付与
  const weightColor = (optionId: string, enabledIds: string[]): string => {
    const percentage = weightPercentage(optionId, enabledIds);
    return WEIGHT_THRESHOLDS.find(({ threshold }) => percentage >= threshold)?.color ?? '';
  };

  return {
    chipColors,
    switchLabels: Object.fromEntries(
      SWITCH_CONFIG.labels.map((label, i) => [i, label])
    ),
    weightTotal: weightTotal,
    weightPercentage: weightPercentage,
    getSwitchLabel,
    getSwitchColor,
    omikujiLists,
    enabledOmikujiLists,
    weightColor,
  };
}