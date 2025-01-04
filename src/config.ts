// src/config.ts
import Swal from 'sweetalert2';

interface Configs {
 botUserId: string;
 PLUGIN_UID: string;
}

export const configs: Configs = {
 botUserId: 'FirstCounter',
 PLUGIN_UID: 'OmikenPlugin01'
};

// sweetalert2グローバル設定(z-indexを変更)
export const MySwal = Swal.mixin({
 willOpen: (popup) => {
  // スタイルシートを動的に追加
  const style = document.createElement('style');
  style.textContent = `
      .swal2-container {
        z-index: 10000 !important;
      }
      .swal2-popup {
        z-index: 10001 !important;
      }
      .swal2-backdrop {
        z-index: 9999 !important;
      }
    `;
  document.head.appendChild(style);

  // 既存の設定も維持
  const container = Swal.getContainer();
  if (container) container.style.zIndex = '10000';
  popup.style.zIndex = '10000';
 }
});