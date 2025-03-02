import HomePreview from "./home";
import AboutPreview from "./about";
import ServicesPreview from "./services";
import PhotoGalleryPreview from "./photo-gallery";
import VideoGalleryPreview from "./video-gallery";
import ContactPreview from "./contact";
import { styled } from "@mui/material";
const PreviewScreen = () => {
  return (
    <Container>
      <HomePreview />
      <AboutPreview />
      <ServicesPreview />
      <PhotoGalleryPreview />
      <VideoGalleryPreview />
      <ContactPreview />
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
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
  },
  paddingBottom: "32px",
}));
