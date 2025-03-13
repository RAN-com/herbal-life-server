import { Modal, styled } from "@mui/material";
import CustomTypography from "@/component/typography";
import { useAppSelector } from "@/redux/store/hook";
import { Masonry } from "@mui/lab";
import React from "react";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import CustomIcon from "../icons";

const PhotoGalleryPreview = () => {
  const images =
    useAppSelector((s) => s?.card?.card_data?.["photo_gallery"] ?? null) ?? [];
  const theme = useAppSelector(
    (s) => s?.card?.card_data?.["personal_details"]?.card_theme
  );
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);

  return (
    <Container
      className="scrollbar"
      id={"photos"}
      sx={{
        border: `2px solid ${theme?.accent_color}`,
        borderRadius: "24px",
        backgroundColor: theme?.background_color,
      }}
    >
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        sx={{
          ".container": {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100vw",
            justifyContent: "center",
            height: "100vh",
            position: "relative",
            top: 0,
            "& header": {
              position: "absolute",
              top: 0,
              left: 0,
              padding: "12px",
              border: "1px solid black",
              backgroundColor: theme?.background_color,
            },
            img: {
              width: "100%",
              height: "100%",
              // maxWidth: "320px",
              objectFit: "contain",
            },
          },
        }}
      >
        <div style={{ margin: "auto", height: "100%", width: "100%" }}>
          <div>
            <CustomIcon
              onClick={() => setSelectedImage(null)}
              name="LUCIDE_ICONS"
              icon="LuX"
              size={18}
              color="black"
              sx={{
                width: "32px",
                margin: "12px",
                height: "32px",
                backgroundColor: "white",
              }}
            />
          </div>
          <ImageGallery
            startIndex={selectedImage ?? undefined}
            autoPlay={false}
            showIndex={true}
            showThumbnails={false}
            items={images.map((e) => ({
              original: e.url,
            }))}
            disableThumbnailScroll={true}
          />
        </div>
        {/* <div className="container">
          <header>
            <CustomIcon
              onClick={() => setSelectedImage(null)}
              name="LUCIDE_ICONS"
              icon="LuX"
            />
          </header>
          <img
            src={selectedImage?.url as string}
            alt={(selectedImage?.description as string) ?? ""}
          />
        </div> */}
      </Modal>
      <div
        className="header"
        style={{
          backgroundColor: theme?.accent_color,
        }}
      >
        <CustomTypography variant={"h5"} color={"white"} fontWeight={"medium"}>
          Photo Gallery
        </CustomTypography>
      </div>
      <Masonry columns={2} spacing={2}>
        {images?.map((img, idx) => (
          <ImageContainer key={idx} onClick={() => setSelectedImage(idx)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                typeof img.url === "string"
                  ? img.url
                  : URL.createObjectURL(img.url)
              }
              alt={img?.description ?? ""}
              loading="lazy"
              style={{
                width: "100%",
                height: "250px",
                // aspectRatio: "1/1",
                display: "block",
                objectFit: "cover",
              }}
            />
          </ImageContainer>
        ))}
      </Masonry>
    </Container>
  );
};

export default PhotoGalleryPreview;

const Container = styled("div")({
  width: "100%",
  height: "100%",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  padding: "0px 32px",
  paddingBottom: "16px",
  maxWidth: "calc(100% - 32px)",
  margin: "auto",

  position: "relative",
  top: 0,
  zIndex: 100,
  ".header": {
    width: "100%",
    maxWidth: "80%",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 0px",
    borderRadius: "0px 0px 12px 12px",
    marginBottom: "12px",
  },
});

const ImageContainer = styled("div")({
  width: "100%",
  position: "relative",
  top: 0,
  backgroundColor: "#a8a8a8",
  margin: "12px 0px",
  borderRadius: "12px",
  overflow: "hidden",
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  cursor: "pointer",
  "&:hover": {
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 100,
      backgroundColor: "#0000001f",
    },
  },
});
