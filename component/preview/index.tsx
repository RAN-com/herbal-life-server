import HomePreview from "./home";
import AboutPreview from "./about";
import ServicesPreview from "./services";
import PhotoGalleryPreview from "./photo-gallery";
import VideoGalleryPreview from "./video-gallery";
import ContactPreview from "./contact";
import { styled } from "@mui/material";
import React from "react";
import { useAppSelector } from "@/redux/store/hook";
import CustomTypography from "../typography";
import { updateWebViews } from "@/firebase/domain";
const PreviewScreen = ({ domain }: { domain: string }) => {
  const data = useAppSelector((s) => s.card.staff_domain);

  React.useEffect(() => {
    updateWebViews(domain as string);
  }, []);

  return (
    <Container>
      <HomePreview />
      <AboutPreview />
      <ServicesPreview />
      <PhotoGalleryPreview />
      <VideoGalleryPreview />
      <ContactPreview />
      <div
        style={{
          padding: "0px 32px",
          position: "relative",
          maxWidth: "calc(100% - 32px)",
          margin: "auto",
        }}
      >
        <CustomTypography>
          Total Page Counts : {data?.views ?? 0}
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
