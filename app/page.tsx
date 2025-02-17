"use client";
// app/page.tsx
import React from "react";
import NotFound from "./not-found";
import { debounce, GlobalStyles, ThemeProvider } from "@mui/material";
import { theme } from "../theme/index";
import MainPage from "../sections/home";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store/index";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import zIndex from "@mui/material/styles/zIndex";
import Loader from "../component/loader";
import CustomTypography from "@/component/typography";
import moment from "moment";

// Using a server component to fetch subdomain from the headers
export default function HomePage() {
  // Function to extract the first subdomain from the hostname
  const getFirstSubdomain = (hostname: string): string | null => {
    if (!hostname.includes("herbal-life")) return null;
    // If the hostname is "localhost" or an IP address, return null
    // if (
    //   hostname === "localhost" ||
    //   hostname === "127.0.0.1" ||
    //   /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) // Matches IP format
    // ) {
    //   return null;
    // }

    // Split the hostname into parts based on the dots
    const parts = hostname.split(".herbal-life");

    console.log(parts);
    // If there are more than two parts, it indicates a subdomain
    // Example: 'subdomain.example.com' -> ['subdomain', 'example', 'com']
    if (parts.length > 1) {
      return parts[0]; // The first part is the subdomain
    }
    if (parts.length === 1 && parts.join("").includes("herbal-life")) {
      return "main";
    }

    // If no subdomain found, return null
    return null;
  };
  const [loading, setLoading] = React.useState(true);
  const [domain, setSubdomain] = React.useState<string | null | undefined>();
  // Check if we are in the client (for local environment fallback)
  const host =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "localhost";

  React.useEffect(() => {
    setLoading(true);
    if (typeof window !== "undefined" && window) {
      const resizeOps = (): void => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      };

      resizeOps();
      window.addEventListener("resize", resizeOps);
    }

    debounce(() => {
      setSubdomain(getFirstSubdomain(host) ?? null);
      setLoading(false);
    }, 600)();
  }, [host]);

  // Extract the first subdomain
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <GlobalStyles
            styles={{
              "& *.scrollbar::-webkit-scrollbar": {
                width: "8px", // Scrollbar width
                height: "8px",
              },
              "& *.scrollbar::-webkit-scrollbar-track": {
                backgroundColor: "#d1d1d1", // Scrollbar track color
                borderRadius: "20px", // Optional: rounded corners for the track
              },
              "& *.scrollbar::-webkit-scrollbar-thumb": {
                backgroundColor: "#6d6d6d", // Scrollbar thumb color
                borderRadius: "10px", // Rounded corners for the thumb
                border: "2px solid #e0e0e0", // Optional: creates padding-like effect
              },
              "& *.scrollbar::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#0056b3", // Color on hover
              },
            }}
          />
          <Toaster
            containerStyle={{ zIndex: zIndex.modal * 10 }}
            toastOptions={{
              style: {
                // position: "fixed",
                zIndex: zIndex.modal * 10,
              },
            }}
          />

          {loading && typeof domain === "undefined" ? (
            <Loader />
          ) : domain === "main" ? (
            <CustomTypography>
              Herbal Life {moment().format("YYYY")}. All Right Reserved
            </CustomTypography>
          ) : domain ? (
            <MainPage domain={domain} />
          ) : (
            !loading && !domain && <NotFound />
          )}
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}
