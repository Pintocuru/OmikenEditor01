// src/composables/funkRules.ts

import { computed } from "vue";
import { OmikujiType, RulesType } from "@/types";

export function funkRules(
  omikuji: Record<string, OmikujiType> | undefined = {},
  omikujiOrder: string[] | undefined = [],
  item?: RulesType |null
) {

  // 定数
  // 各レベルの色
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
    // omikujiOrderが存在する場合はそれに従って並び替え
    if (omikujiOrder && omikujiOrder.length > 0) {
      return omikujiOrder
        .map(id => {
          const omikujiItem = omikuji[id];
          return omikujiItem ? { id, name: omikujiItem.name, weight: omikujiItem.weight } : null;
        })
        .filter((option): option is { id: string, name: string, weight: number } => option !== null);
    }

    // omikujiOrderがない場合は従来の方法で並び替え
    return Object.entries(omikuji).map(([id, omikuji]) => ({
      id,
      name: omikuji.name,
      weight: omikuji.weight,
    }));
  });

  // 有効なomikujiのリスト
  const enabledOmikujiLists = computed(() => {
    // enabledIdsが空なら、すべてのおみくじが有効
    const isAllEnabled = item?.enabledIds.length === 0;
    if (!item || isAllEnabled) return omikujiLists.value;
    return omikujiLists.value.filter((option) =>
      item.enabledIds.includes(option.id)
    );
  });

  const chipColors = computed(() => {
    return enabledOmikujiLists.value.map((option) => ({
      id: option.id,
      color: weightColor(option.id),
    }));
  });

  // totalWeight関数で合計を計算
  const totalWeight = (): number => {
    const validOmikujiIds = enabledOmikujiLists.value.map((o) => o.id);
    return validOmikujiIds.reduce(
      (sum, id) => sum + (omikuji[id]?.weight || 0),
      0
    );
  };

  // totalWeightPercentage関数で割合を計算
  const totalWeightPercentage = (optionId: string): number => {
    const option = omikuji[optionId];
    if (!option?.weight) return 0;

    const total = totalWeight();
    return parseFloat(((option.weight / total) * 100).toFixed(1));
  };

  // v-chipに色を付与
  const weightColor = (optionId: string): string => {
    const percentage = totalWeightPercentage(optionId);

    return (
      WEIGHT_THRESHOLDS.find(({ threshold }) => percentage >= threshold)
        ?.color || ""
    );
  };

  return {
    chipColors,
    switchLabels: Object.fromEntries(
      SWITCH_CONFIG.labels.map((label, i) => [i, label])
    ),
    totalWeight,
    totalWeightPercentage,
    getSwitchLabel,
    getSwitchColor,
    omikujiLists,
    enabledOmikujiLists,
    weightColor,
  };
}
