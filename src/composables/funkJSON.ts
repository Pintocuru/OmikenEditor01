// src/composables/funkJSON.ts
import { DataType, Mode, AppEditorType, OmikenType, ParamsType } from '@type';
import { configs, MySwal } from '@/config';
import { OmikenValidate } from '@/composables/FunkValidate';
import OneSDK from '@onecomme.com/onesdk';

// JSONデータの読み込み・書き込み
export function funkJSON() {
 // Omikenの保存
 const saveOmiken = async (Omiken: OmikenType): Promise<void> => {
  try {
   const response = await ApiClient.request({ method: 'POST', mode: Mode.Backup, type: DataType.Omiken }, Omiken);
   // PluginのAPIにPOST送信
   await MySwal.fire({
    title: '保存したよ',
    text: 'データの保存に成功したよ。',
    icon: 'success',
    confirmButtonText: 'OK'
   });
  } catch (error) {
   console.error('Error saving data:', error);
   await MySwal.fire({
    title: '保存失敗',
    text: 'データの保存に失敗しました。',
    icon: 'error',
    confirmButtonText: 'OK'
   });
   throw error;
  }
 };

 // Sweetalert2を使用したトースト的な通知
 const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  MySwal.fire({
   toast: true,
   position: 'top-end',
   showConfirmButton: false,
   timer: 3000,
   timerProgressBar: true,
   icon: type,
   title: message
  });
 };

 return {
  saveOmiken
 };
}

// APIクライアント
export class ApiClient {
 private static readonly baseUrl = `http://localhost:11180/api/plugins/${configs.PLUGIN_UID}`;

 static async request<T extends ParamsType>(params: T, data?: object): Promise<string> {
  const config = {
   headers: { 'Content-Type': 'application/json' },
   data: data || {}
  };

  const url = `${this.baseUrl}?mode=${params.mode}&type=${params.type || ''}`;

  try {
   const response = params.method === 'GET' ? await OneSDK.get(url, {}) : await OneSDK.post(url, config);

   this.validateResponse(response, params.type);
   return response.data.response;
  } catch (error) {
   throw new ApiError(params.method, params.mode, params.type, error);
  }
 }

 // わんコメが起動していない・プラグインが切られた等でデータが帰ってこないなら致命的なエラー
 private static validateResponse(response: any, type: string = ''): void {
  if (!response.data || response.data.code !== 200) {
   throw new ApiError('VALIDATION', '', type, 'Invalid response');
  }
 }
}

// カスタムエラークラス
class ApiError extends Error {
 constructor(
  public method: string,
  public mode: string,
  public type: string = '',
  public originalError: unknown
 ) {
  super(`API Error: ${method} ${mode} ${type}`);
  this.name = 'ApiError';
 }
}

// メインのデータサービス
export async function AppEditorFetch(): Promise<AppEditorType> {
 try {
  const response = await ApiClient.request({ method: 'GET', mode: Mode.AllData });
  const data = JSON.parse(response);

  return {
   Presets: data.Presets,
   Charas: data.Charas,
   Scripts: data.Scripts,
   Omiken: OmikenValidate(data.Omiken)
  };
 } catch (error) {
  if (error instanceof ApiError) console.error('API Error:', error);
  throw error;
 }
}
