import { styled } from "@mui/material";
import CustomTypography from "@/component/typography";
import { useAppSelector } from "@/redux/store/hook";
import { encryptData } from "@/utils/crypto";
import { useEffect, useRef } from "react";

/**
 * VideoGalleryPreview component renders a gallery of videos that play when they come into view.
 *
 * This component uses the `useAppSelector` hook to retrieve video gallery data and theme information from the Redux store.
 * It also uses the `useRef` hook to store references to all video elements and the `useEffect` hook to set up an IntersectionObserver
 * that plays or pauses videos based on their visibility in the viewport.
 *
 * The `handlePlay` function ensures that only one video plays at a time by pausing all other videos when one starts playing.
 *
 * @returns {JSX.Element} The rendered video gallery component.
 */

const VideoGalleryPreview = () => {
  const images = useAppSelector(
    (s) => s?.card?.card_data?.["video_gallery"] ?? []
  );
  const theme = useAppSelector(
    (s) => s?.card?.card_data?.["personal_details"]?.card_theme
  );

  const videoRefs = useRef<HTMLVideoElement[]>([]); // Store all video refs

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // Play when 50% of the video is visible
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, []);

  const handlePlay = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause(); // Pause all other videos when one plays
      }
    });
  };

  return (
    <Container
      key={encryptData(`${new Date().toISOString()}-video`)}
      className="scrollbar"
      id="videos"
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
        <CustomTypography variant="h5" color="white" fontWeight="medium">
          Video Gallery
        </CustomTypography>
      </div>

      {images?.map((img, index) => (
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
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              src={
                typeof img.url === "string"
                  ? img.url
                  : URL.createObjectURL(img.url)
              }
              autoPlay={false}
              muted={false}
              controls
              controlsList="nodownload"
              onPlay={() => handlePlay(index)}
            />
          </ImageContainer>
        </div>
      ))}
    </Container>
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
