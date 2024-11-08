// src/composables/funkRules.ts

import { computed, inject, Ref } from "vue";
import { AppStateType, OmikenType } from "@/types";

export function FunkRules() {
  // inject
  const AppState = inject<Ref<AppStateType>>("AppStateKey");
  const omikuji = computed(() => AppState?.value.Omiken.omikuji ?? {});

  // 定数
  const SWITCH_CONFIG = {
    labels: ["無効", "だれでも", "メンバー", "モデレーター", "管理者"],
    colors: ["", "yellow", "green", "blue", "red"],
  };

  const COLORS = {
    VERY_HIGH: "red",
    HIGH: "orange",
    SLIGHTLY_HIGH: "yellow",
    MEDIUM: "green",
    SLIGHTLY_LOW: "cyan",
    LOW: "blue",
    VERY_LOW: "purple",
    ZERO: "gray",
  };

  // switch名とカラーの取得
  const getSwitchLabel = (switchValue: number) =>
    SWITCH_CONFIG.labels[switchValue] || "Unknown";
  const getSwitchColor = (switchValue: number) =>
    SWITCH_CONFIG.colors[switchValue] || "";

  // omikujiのリスト
  const omikujiLists = computed(() => {
    return Object.entries(omikuji.value || {}).map(([id, omikuji]) => ({
      id,
      name: omikuji.name,
      weight: omikuji.weight,
    }));
  });

  // 有効なomikujiのリスト
  const enabledOmikujiLists = (enabledIds: string[] = []) => {
    const isAllEnabled = enabledIds.length === 0;
    return isAllEnabled
      ? omikujiLists.value
      : omikujiLists.value.filter((option) => enabledIds.includes(option.id));
  };

  const chipColors = (enabledIds: string[]) => {
    return Object.keys(omikuji).map((id) => ({
      id,
      color: weightColor.value(id, enabledIds),
    }));
  };

  // weight合計を計算
  const weightTotal = computed(
    () => (enabledIds: string[]) =>
      enabledIds.reduce((sum, id) => sum + (omikuji.value[id]?.weight ?? 0), 0)
  );

  // totalWeightの割合を計算
  const weightPercentage = computed(
    () => (optionId: string, enabledIds: string[]) => {
      const weight = omikuji.value[optionId]?.weight ?? 0;
      const total = weightTotal.value(enabledIds);
      return total > 0 ? parseFloat(((weight / total) * 100).toFixed(1)) : 0;
    }
  );

  // v-chipに色を付与
  const weightColor = computed(
    () => (optionId: string, enabledIds: string[]) => {
      const percentage = weightPercentage.value(optionId, enabledIds);
      if (percentage === 0) return COLORS.ZERO;

      const weights = enabledIds
        .map((id) => weightPercentage.value(id, enabledIds))
        .filter((w) => w > 0);
      const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
      const std = Math.sqrt(
        weights.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) /
          weights.length
      );

      if (percentage >= avg + std * 2.4) return COLORS.VERY_HIGH;
      if (percentage >= avg + std * 1.6) return COLORS.HIGH;
      if (percentage >= avg + std * 0.8) return COLORS.SLIGHTLY_HIGH;
      if (percentage >= avg - std * 0.8) return COLORS.MEDIUM;
      if (percentage >= avg - std * 1.6) return COLORS.SLIGHTLY_LOW;
      if (percentage >= avg - std * 2.4) return COLORS.LOW;
      return COLORS.VERY_LOW;
    }
  );

  return {
    chipColors,
    switchLabels: Object.fromEntries(
      SWITCH_CONFIG.labels.map((label, i) => [i, label])
    ),
    weightTotal,
    weightPercentage,
    getSwitchLabel,
    getSwitchColor,
    omikujiLists,
    enabledOmikujiLists,
    weightColor,
  };
}

//
export const rulesOfPlaces = (Omiken: OmikenType, enabledIds?: string[]) => {
  const displayPlaces = computed(() => {
    if (!enabledIds) return Object.values(Omiken.place);

    const usedPlaceNames = enabledIds
      .flatMap((id) => Omiken.omikuji[id]?.post ?? [])
      .flatMap((post) => {
        const matches = post.content?.match(/<<([^>>]+)>>/g) ?? [];
        return matches.map((m) => m.replace(/<<|>>/g, ""));
      });

    return Object.values(Omiken.place).filter((place) =>
      usedPlaceNames.includes(place.name)
    );
  });

  return {
    displayPlaces,
  };
};
