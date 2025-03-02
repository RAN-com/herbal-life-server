import { styled } from "@mui/material";
import CustomTypography from "@/component/typography";
import { useAppSelector } from "@/redux/store/hook";

const VideoGalleryPreview = () => {
  const images = useAppSelector(
    (s) => s?.card?.card_data?.["video_gallery"] ?? []
  );
  const theme = useAppSelector(
    (s) => s?.card?.card_data?.["personal_details"]?.card_theme
  );

  return (
    images.length !== 0 && (
      <Container
        className="scrollbar"
        id={"videos"}
        sx={{
          border: `2px solid ${theme?.accent_color}`,
          borderRadius: "24px",
          backgroundColor: theme?.background_color,
        }}
      >
        <div
          className="header"
          style={{
            backgroundColor: theme?.accent_color,
          }}
        >
          <CustomTypography
            variant={"h5"}
            color={"white"}
            fontWeight={"medium"}
          >
            Video Gallery
          </CustomTypography>
        </div>

        {images?.map((img) => (
          <div
            key={img.title}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <ImageContainer>
              <video
                src={
                  typeof img.url === "string"
                    ? img.url
                    : URL.createObjectURL(img.url)
                }
                autoPlay={true}
                controls={true}
                controlsList="nodownload"
              />
            </ImageContainer>
          </div>
        ))}
      </Container>
    )
  );
};

export default VideoGalleryPreview;

const Container = styled("div")({
  width: "100%",
  height: "100%",
  overflowY: "auto",
  display: "flex",
  paddingBottom: "16px",
  maxWidth: "calc(100% - 32px)",
  margin: "auto",
  flexDirection: "column",
  padding: "0px 32px",
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
  ".icon": {
    position: "absolute",
    right: "12px",
    top: "12px",
    zIndex: 10,
  },
  backgroundColor: "#a8a8a8",
  margin: "12px 0px",
  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});
