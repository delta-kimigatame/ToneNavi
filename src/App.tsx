import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React from "react";
import { Header } from "./features/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { useThemeMode } from "./hooks/useThemeMode";
import { getDesignTokens } from "./config/theme";
import { MainPaper } from "./components/Top/MainPaper";
import { HistoryPaper } from "./components/Top/HistoryPaper";
import { LinkPaper } from "./components/Top/LinkPaper";

export const App = () => {
  const { mode, toggleMode } = useThemeMode();

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header mode={mode} onToggleMode={toggleMode} />
          <br />
          <br />
          <MainPaper />
          <HistoryPaper />
          <LinkPaper />
      <Footer />
    </ThemeProvider>
  );
};
