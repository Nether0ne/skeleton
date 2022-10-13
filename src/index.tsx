import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import React, { FC } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";

const root = createRoot(document.body);

const Index: FC = () => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={undefined} />

      <App />
    </ThemeProvider>
  );
};

root.render(<Index />);
