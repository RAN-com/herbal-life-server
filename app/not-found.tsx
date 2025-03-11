"use client";
import { Button, styled } from "@mui/material";
import Image from "next/image";
import NotFoundPNG from "@/assets/not-found.png";
import CustomTypography from "../component/typography";

function removeSubdomainsAndRedirect() {
  const { hostname, protocol, pathname, search, port } = window.location;
  // Split the hostname to check for subdomains
  const hostParts = hostname.split(".");

  // Check if hostname is localhost or an IP address
  const isLocalhost =
    hostname.includes("localhost") || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  if (!isLocalhost && hostParts.length > 2) {
    // For non-localhost, keep only the last two parts (e.g., "example.com")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, ...others] = hostname.split(".");

    const redirectUrl = `${protocol}//${others}${pathname}${search}`;
    window.location.replace(redirectUrl);
  } else if (isLocalhost && hostParts.length > 1) {
    // For localhost or IP, keep only the "localhost" or IP part and include the port
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, ...others] = hostname.split(".");
    const redirectUrl = `${protocol}//${others.join(".")}${
      port ? `:${port}` : ""
    }${pathname}${search}`;
    window.location.replace(redirectUrl);
  }
}

export default function NotFound() {
  return (
    <Container>
      <Image
        src={NotFoundPNG}
        alt=""
        height={200}
        width={200}
        style={{
          width: "100%",
          maxWidth: "440px",
          margin: "0 auto",
          height: "max-content",
          objectFit: "contain",
          userSelect: "none",
        }}
      />
      <div className="content">
        <CustomTypography variant={"h5"} textAlign={"center"}>
          Oops! This page doesn&apos;t exist or has been moved!
        </CustomTypography>
        <CustomTypography
          variant={"body2"}
          fontWeight={"light"}
          textAlign={"center"}
        >
          Need help? Go back to the homepage or contact support
        </CustomTypography>
      </div>
      <Button
        variant="contained"
        sx={{
          ".MuiButton-root": {
            marginTop: "12px",
          },
          borderRadius: "24px",
          backgroundColor: "#0a0a0a",
        }}
        disableElevation
        disableFocusRipple
        disableRipple
        disableTouchRipple
      >
        <CustomTypography
          variant="body2"
          sx={{
            // fontWeight: "bold",
            padding: "8px 24px",
          }}
          onClick={() => {
            removeSubdomainsAndRedirect();
          }}
        >
          Return to Homepage
        </CustomTypography>
      </Button>
    </Container>
  );
}

const Container = styled("div")({
  width: "100%",
  height: `calc(${window.screen.availHeight}px - 164px)`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "& *": {
    userSelect: "none",
    msUserSelect: "none",
    MozUserSelect: "none",
  },
  ".content": {
    display: "flex",
    flexDirection: "column",
    paddingBottom: "12px",
    "& *": {
      margin: "auto",
      textAlign: "center",
    },
  },
});
