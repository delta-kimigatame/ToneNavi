import type { PaletteMode, ThemeOptions } from "@mui/material";
import { blueGrey, grey } from "@mui/material/colors";

export type ColorTheme = "default";

type ToneScale = Record<100 | 300 | 500, string>;

type ThemePaletteMap = Record<
  ColorTheme,
  {
    primary: ToneScale;
    secondary: ToneScale;
  }
>;

const pallets: ThemePaletteMap = {
  default: {
    primary: {
      100: "#D1C4E9",
      300: "#9575CD",
      500: "#673AB7"
    },
    secondary: {
      100: "#FFCCBC",
      300: "#FF8A65",
      500: "#F4511E"
    }
  }
};

/**
 * 全体のテーマを設定する。
 *  */
export const getDesignTokens = (
  mode: PaletteMode,
  colorTheme: ColorTheme = "default"
): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: {
            light: pallets[colorTheme]["primary"][100],
            main: pallets[colorTheme]["primary"][300],
            dark: pallets[colorTheme]["primary"][500]
          },
          secondary: {
            light: pallets[colorTheme]["secondary"][100],
            main: pallets[colorTheme]["secondary"][300],
            dark: pallets[colorTheme]["secondary"][500]
          },
          text: {
            primary: grey[900],
            secondary: grey[800]
          },
          background: {
            default: grey[200],
            paper: grey[200]
          }
        }
      : {
          // palette values for dark mode
          primary: {
            light: pallets[colorTheme]["primary"][100],
            main: pallets[colorTheme]["primary"][300],
            dark: pallets[colorTheme]["primary"][500]
          },
          secondary: {
            light: pallets[colorTheme]["secondary"][100],
            main: pallets[colorTheme]["secondary"][300],
            dark: pallets[colorTheme]["secondary"][500]
          },
          text: {
            primary: "#fff",
            secondary: grey[500]
          },
          background: {
            default: blueGrey[900],
            paper: blueGrey[900]
          }
        })
  }
});
