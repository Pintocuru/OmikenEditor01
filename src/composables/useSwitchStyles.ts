// src/composables/useSwitchStyles.ts
export function useSwitchStyles() {
  const getSwitchLabel = (switchValue: number) => {
    const labels = ['OFF', 'だれでも', 'メンバー', 'モデレーター', '管理者'];
    return labels[switchValue] || 'Unknown';
  };

  const getSwitchColor = (switchValue: number) => {
    const colors = ['', 'yellow', 'green', 'blue', 'red'];
    return colors[switchValue] || 'default';
  };

  return {
    getSwitchLabel,
    getSwitchColor
  };
}