"use client";
import { Button, styled } from "@mui/material";
import Image from "next/image";
import NotFoundPNG from "@/assets/not-found.png";
import CustomTypography from "../component/typography";
import { useRouter } from "next/router";

export default function NotFound() {
  const router = useRouter();

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
            const domain = window.location.hostname;
            router.replace("https://" + domain);
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
  height: "calc(100%)",
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
