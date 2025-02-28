"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/theme";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/redux/store";
import { Toaster } from "react-hot-toast";
import { GlobalStyles } from "@mui/material";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <GlobalStyles
            styles={{
              "& *.scrollbar::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "& *.scrollbar::-webkit-scrollbar-track": {
                backgroundColor: "#d1d1d1",
                borderRadius: "20px",
              },
              "& *.scrollbar::-webkit-scrollbar-thumb": {
                backgroundColor: "#6d6d6d",
                borderRadius: "10px",
                border: "2px solid #e0e0e0",
              },
              "& *.scrollbar::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#0056b3",
              },
            }}
          />
          <Toaster />
          {children}
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}
