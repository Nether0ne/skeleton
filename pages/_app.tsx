import * as React from "react";
import type { AppProps } from "next/app";
import { FC } from "react";
import { CssBaseline, useTheme } from "@mui/material";
import { SnackbarProvider } from "notistack";
import SnackbarCloseButton from "@components/misc/snackbar/SnackbarCloseButton";
import createEmotionCache from "@helpers/emotion/createEmotionCache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import ThemeProvider from "@providers/Theme.provider";

const clientSideEmotionCache = createEmotionCache();

interface Props extends AppProps {
  emotionCache: EmotionCache;
}

const App: FC<Props> = ({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}) => {
  const theme = useTheme();

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider {...theme}>
        <CssBaseline />

        <SnackbarProvider
          maxSnack={3}
          action={(snackbarKey) => (
            <SnackbarCloseButton snackbarKey={snackbarKey} />
          )}>
          <Component {...pageProps} />
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
