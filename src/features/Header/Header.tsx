import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import React from "react";
import { HeaderLogo } from "../../components/Header/HeaderLogo";

/**
 * このアプリのヘッダー
 * @returns
 */
export const Header: React.FC<HeaderProps> = ({ mode, onToggleMode }) => {
  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "40" }}>
        <HeaderLogo />
        <IconButton color="inherit" aria-label="toggle color mode" onClick={onToggleMode}>
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export interface HeaderProps {
  /**
   * 現在のカラーモード。
   */
  mode: PaletteMode;
  /**
   * ダーク/ライトモードを切り替えるハンドラー。
   */
  onToggleMode: () => void;
}
