import HomePreview from "./home";
import AboutPreview from "./about";
import ServicesPreview from "./services";
import PhotoGalleryPreview from "./photo-gallery";
import VideoGalleryPreview from "./video-gallery";
import ContactPreview from "./contact";
import { styled } from "@mui/material";
import React from "react";
import { useAppSelector } from "@/redux/store/hook";
import { updateWebViews } from "@/firebase/domain";
import CustomTypography from "../typography";
const PreviewScreen = ({ domain }: { domain: string }) => {
  const theme = useAppSelector(
    (s) => s.card?.card_data?.personal_details?.card_theme
  );

  React.useEffect(() => {
    updateWebViews(domain as string);
  }, []);

  return (
    <Container
      sx={{
        backgroundColor: theme?.accent_color + "9a",
      }}
    >
      <HomePreview />
      <AboutPreview />
      <ServicesPreview />
      <PhotoGalleryPreview />
      <VideoGalleryPreview />
      <ContactPreview />
      <div style={{ margin: "auto" }}>
        <CustomTypography gap={"2pt"} color={"#ffffffaa"}>
          Created By{" "}
          <a
            href="https://raninfo.in"
            style={{
              color: "inherit",
              // textDecoration: "none",
            }}
            target="_blank"
          >
            Ran Infotech
          </a>
        </CustomTypography>
      </div>
    </Container>
  );
};

export default PreviewScreen;

const Container = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: "420px",
  height: "100%",
  display: "grid",
  gridTemplateColumns: "1fr",
  margin: "auto",
  gap: "12px",
  backgroundColor: "white",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
  },
  paddingBottom: "32px",
}));
