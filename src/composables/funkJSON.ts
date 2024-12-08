// src/composables/funkJSON.ts
import { ref } from "vue";
import { validateData } from "./FunkValidate";
import type { OmikenType, PresetOmikenType, PresetType } from "@/types/index";
import _ from "lodash";
import Swal from "sweetalert2";
import axios from "axios";
import { useToast } from "vue-toastification";
import { configs } from "@/config";

// JSONデータの読み込み・書き込み
export function funkJSON() {
  const canUpdateJSON = ref(false); // * テストモード:JSONを書き込みするか
  const isLoading = ref(false); // 読み込み中かどうか、読み込み失敗ならずっとtrue
  const noAppBoot = ref(false); // 起動できたか
  const baseUrl = "http://localhost:11180/api/plugins/" + configs.PLUGIN_UID;

  // OmikenとCharaデータの読み込み
  const fetchPreset = async () => {
    isLoading.value = true;
    try {
      // index.jsonからプリセット一覧取得
      const response = await fetch("/index.json");
      const presets = await response.json();

      // 型ごとにデータ取得と整形
      const [charaData, presetData] = await Promise.all([
        fetchChara(presets.filter((p: PresetType) => p.type === "Chara")),
        fetchPreOmiken(presets.filter((p: PresetType) => p.type === "Omiken")),
      ]);

      return { Charas: charaData, Presets: presetData };
    } catch (error) {
      console.error("Failed to load data:", error);
      throw new Error("データの読み込みに失敗しました");
    } finally {
      isLoading.value = false;
    }
  };

  // Preset.Charaの読み込み
  const fetchChara = async (charaPaths: PresetType[]) => {
    const responses = await Promise.all(
      charaPaths.map(async (p) => {
        const item = await fetch(p.path).then((r) => r.json());
        return { ...p, item } as PresetCharaType;
      })
    );
    return responses.reduce<Record<string, PresetCharaType>>((acc, chara) => {
      acc[chara.id] = chara;
      return acc;
    }, {});
  };

  // Preset.Omikenの読み込み
  const fetchPreOmiken = async (presetPaths: PresetOmikenType[]) => {
    const responses = await Promise.all(
      presetPaths.map(async (p) => {
        const item = await fetch(p.path).then((r) => r.json());
        return { ...p, item } as PresetOmikenType;
      })
    );
    return responses.reduce<Record<string, PresetOmikenType>>((acc, data) => {
      acc[data.id] = data;
      return acc;
    }, {});
  };

  // 現在のOmiken読み込み
  const fetchOmiken = async (): Promise<OmikenType | null> => {
    // 取得中ならreturn
    if (isLoading.value) {
      console.warn("データの取得が既に進行中です");
      return null;
    }
    isLoading.value = true;

    try {
      // プラグインのAPIから読み込み
      const data = await apiRequest("GET", "data", "Omiken");

      // データの検証と正規化
      const validatedData: OmikenType = {
        types: validateData("types", data.types),
        rules: validateData("rules", data.rules),
        omikujis: validateData("omikujis", data.omikujis),
        places: validateData("places", data.places),
      };

      await Swal.fire({
        title: "読み込み完了",
        text: "データの読み込みが完了しました。",
        icon: "success",
        confirmButtonText: "OK",
      });
      isLoading.value = false;
      return validatedData;
    } catch (error) {
      noAppBoot.value = true;
      await Swal.fire({
        title: "読み込み失敗",
        text: "データの読み込みに失敗しました。アプリケーションを起動できません。",
        icon: "error",
        confirmButtonText: "OK",
      });
      throw new Error("データ読み込み失敗");
    }
  };

  // Omikenの保存
  const saveOmiken = async (Omiken: OmikenType): Promise<void> => {
    if (noAppBoot.value) {
      showToast("データ保存はできません", "warning");
      return;
    }
    // テストモード:保存できたことをログに表示
    if (!canUpdateJSON.value) {
      showToast("💾saveDataまで届きました", "info");
      console.warn("💾saveDataまで届きました:", Omiken);
      return;
    }
    // ロード中ならreturn
    if (isLoading.value) {
      console.warn("💾canUpdateJSON:true");
      return;
    }

    isLoading.value = true;

    try {
      const response = await apiRequest("POST", "writing", "", Omiken);
      // PluginのAPIにPOST送信
      await Swal.fire({
        title: "保存したよ",
        text: "データの保存に成功したよ。",
        icon: "success",
        confirmButtonText: "OK",
      });

      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error saving data:", error);
      await Swal.fire({
        title: "保存失敗",
        text: "データの保存に失敗しました。",
        icon: "error",
        confirmButtonText: "OK",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Sweetalert2を使用したトースト的な通知
  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: type,
      title: message,
    });
  };

  // プラグインからAPI叩いてget/Post
  const apiRequest = async (
    method: "GET" | "POST",
    mode: string,
    type?: string,
    data?: object
  ): Promise<any> => {
    try {
      const url = `${baseUrl}?mode=${mode},type=${type || ""},`;
      const response =
        method === "GET" ? await axios.get(url) : await axios.post(url, data);

      return response.data;
    } catch (error) {
      console.error("Failed to fetch services:", error);
      return {};
    }
  };

  return {
    fetchPreset,
    canUpdateJSON,
    isLoading,
    fetchOmiken,
    saveOmiken,
  };
}
