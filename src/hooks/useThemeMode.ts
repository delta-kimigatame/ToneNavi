import type { PaletteMode } from "@mui/material";
import React from "react";

/**
 * テーマモードを管理するカスタムフック。
 *
 * 起動時は端末設定（prefers-color-scheme）を参照して初期値を決定し、
 * その後はアプリ内で `light` / `dark` を切り替えて利用します。
 * `system` モードは保持しません。
 *
 * @returns テーマモードと切替用ハンドラー
 */
export const useThemeMode = (): UseThemeModeResult => {
  const [mode, setMode] = React.useState<PaletteMode>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return "light";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const toggleMode = React.useCallback(() => {
    setMode((previousMode) => (previousMode === "dark" ? "light" : "dark"));
  }, []);

  return {
    mode,
    setMode,
    toggleMode
  };
};

export interface UseThemeModeResult {
  /**
   * 現在のテーマモード。
   */
  mode: PaletteMode;
  /**
   * テーマモードを明示的に設定する関数。
   */
  setMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
  /**
   * テーマモードを `light` と `dark` でトグルする関数。
   */
  toggleMode: () => void;
}
