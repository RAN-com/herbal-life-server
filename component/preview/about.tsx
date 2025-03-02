import { styled } from "@mui/material";
import Renderer from "@/component/renderer";
import CustomTypography from "@/component/typography";
import { useAppSelector } from "@/redux/store/hook";

const AboutPreview = () => {
  const about = useAppSelector((s) => s?.card?.card_data?.["about"] ?? null);
  const theme = useAppSelector(
    (s) => s?.card?.card_data?.["personal_details"]?.card_theme
  );

  return (
    <Container
      id={"about"}
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
        <CustomTypography variant={"h5"} color={"white"} fontWeight={"medium"}>
          About Us
        </CustomTypography>
      </div>
      <div className="content">{about && <Renderer data={about} />}</div>
    </Container>
  );
};

export default AboutPreview;

const Container = styled("div")({
  width: "100%",
  height: "auto",
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
  ".content": {
    width: "100%",
    height: "max-content",
    listStylePosition: "inside",
    "p, li, ul": {
      fontFamily: "DM Sans",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "Syne",
    },
  },
});
