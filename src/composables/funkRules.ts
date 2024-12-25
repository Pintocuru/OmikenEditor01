// src/composables/funkRules.ts

import { computed, inject, Ref } from "vue";
import { AppEditorType, OmikenType } from "@/types";

export function FunkRules() {
  // inject
  const AppEditor = inject<Ref<AppEditorType>>("AppEditorKey");
  const omikuji = computed(() => AppEditor?.value.Omiken.omikujis ?? {});

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
  const enabledOmikujiLists = (enableIds: string[] = []) => {
    const isAllEnabled = enableIds.length === 0;
    return isAllEnabled
      ? omikujiLists.value
      : omikujiLists.value.filter((option) => enableIds.includes(option.id));
  };

  const chipColors = (enableIds: string[]) => {
    return Object.keys(omikuji).map((id) => ({
      id,
      color: weightColor.value(id, enableIds),
    }));
  };

  // weight合計を計算
  const weightTotal = computed(
    () => (enableIds: string[]) =>
      enableIds.reduce((sum, id) => sum + (omikuji.value[id]?.weight ?? 0), 0)
  );

  // totalWeightの割合を計算
  const weightPercentage = computed(
    () => (optionId: string, enableIds: string[]) => {
      const weight = omikuji.value[optionId]?.weight ?? 0;
      const total = weightTotal.value(enableIds);
      return total > 0 ? parseFloat(((weight / total) * 100).toFixed(1)) : 0;
    }
  );

  // v-chipに色を付与
  const weightColor = computed(
    () => (optionId: string, enableIds: string[]) => {
      const percentage = weightPercentage.value(optionId, enableIds);
      if (percentage === 0) return COLORS.ZERO;

      const weights = enableIds
        .map((id) => weightPercentage.value(id, enableIds))
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

  // rulesのenableIds に入っているomikujiのプレースホルダーを探す
  const rulesOfPlaces = (Omiken: OmikenType, enableIds?: string[]) =>
    computed(() => {
      if (!enableIds) return Object.values(Omiken.places);

      const usedPlaceNames = enableIds
        .flatMap((id) => Omiken.omikujis[id]?.post ?? [])
        .flatMap((post) => {
          const matches = post.content?.match(/<<([^>>]+)>>/g) ?? [];
          return matches.map((m) => m.replace(/<<|>>/g, ""));
        });

      return Object.values(Omiken.places).filter((place) =>
        usedPlaceNames.includes(place.name)
      );
    });

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
    rulesOfPlaces,
  };
}
