"use client";
// app/page.tsx
import React from "react";
import NotFound from "./not-found";
import { debounce } from "@mui/material";
import MainPage from "../sections/home";
import Loader from "../component/loader";
import CustomTypography from "@/component/typography";
import moment from "moment";
import { useAppSelector, useAppDispatch } from "@/redux/store/hook";
import { setCurrentDomain } from "@/redux/features/user/card";

// Using a server component to fetch subdomain from the headers
export default function HomePage() {
  const dispatch = useAppDispatch();
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
  const domain = useAppSelector((s) => s.card.domain);
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

    dispatch(setCurrentDomain(getFirstSubdomain(host) ?? null));
    debounce(() => {
      setLoading(false);
    }, 600)();
  }, [host]);

  // Extract the first subdomain
  return loading && typeof domain === "undefined" ? (
    <Loader />
  ) : domain === "main" ? (
    <CustomTypography>
      Herbal Life {moment().format("YYYY")}. All Right Reserved
    </CustomTypography>
  ) : domain ? (
    <MainPage domain={domain} />
  ) : (
    !loading && !domain && <NotFound />
  );
}
