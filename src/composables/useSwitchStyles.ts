// src/composables/useOmikujiStyles.ts

import { computed } from 'vue';
import { omikujiType, rulesType } from '@/types';

export function useSwitchStyles(omikuji: Record<string, omikujiType>, item?: rulesType) {

  // 定数をオブジェクトにまとめる
  const SWITCH_CONFIG = {
    labels: ['無効', 'だれでも', 'メンバー', 'モデレーター', '管理者'],
    colors: ['', 'yellow', 'green', 'blue', 'red']
  };

  const WEIGHT_THRESHOLDS = [
    { threshold: 80, color: 'red' },
    { threshold: 60, color: 'yellow' },
    { threshold: 40, color: 'green' },
    { threshold: 20, color: 'cyan' },
    { threshold: 1, color: 'blue' },
  ];


  const getSwitchLabel = (switchValue: number) =>
    SWITCH_CONFIG.labels[switchValue] || 'Unknown';

  const getSwitchColor = (switchValue: number) =>
    SWITCH_CONFIG.colors[switchValue] || '';


  // おみくじのオプションを定義
  const omikujiOptions = computed(() =>
    Object.entries(omikuji).map(([id, omikuji]) => ({
      id,
      name: omikuji.name,
      weight: omikuji.weight,
    }))
  );

  // 有効なおみくじオプションを計算
  const validOmikujiOptions = computed(() => {
    if (!item || !Array.isArray(item.disabledIds)) return omikujiOptions.value;
    return omikujiOptions.value.filter(
      (option) => !item.disabledIds.includes(option.id)
    );
  });

  // すべてのおみくじが無効かどうかを確認
  const isAllDisabled = computed(() => {
    return item?.disabledIds?.length === Object.keys(omikuji).length;
  });

  const chipColors = computed(() => {
    return validOmikujiOptions.value.map(option => ({
      id: option.id,
      color: getWeightColor(option.id),
    }));
  });

  // v-chipに色を付与
const getWeightColor = (optionId: string): string => {
  const option = omikuji[optionId];
  if (!option?.weight) return "";
  
  // 有効なおみくじの合計重みを計算
  const validOmikujiIds = validOmikujiOptions.value.map(o => o.id);
  const totalWeight = validOmikujiIds
    .reduce((sum, id) => sum + (omikuji[id]?.weight || 0), 0);
  
  const percentage = (option.weight / totalWeight) * 100;
  
  return WEIGHT_THRESHOLDS.find(({threshold}) => percentage >= threshold)?.color || "";
};

  return {
    chipColors,
    switchLabels: Object.fromEntries(SWITCH_CONFIG.labels.map((label, i) => [i, label])),
    getSwitchLabel,
    getSwitchColor,
    omikujiOptions,
    validOmikujiOptions,
    isAllDisabled,
    getWeightColor
  };
}