import { Avatar, Button, Divider, styled } from "@mui/material";
import { grey } from "@mui/material/colors";
import CustomTypography from "@/component/typography";
import useFluidTypography from "@/hooks/fluid-typo";
import { useAppSelector } from "@/redux/store/hook";
import { capitalizeSentence } from "@/utils/functions";

const HomePreview = () => {
  const data = useAppSelector((s) => s.card.card_data);
  return (
    <Container
      sx={{
        backgroundImage: `url(${data?.personal_details?.card_theme?.hero_bg_image})`,
        backgroundSize: "cover",
        position: "relative",
        top: 0,
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#05000052",
          zIndex: -1,
        },
        zIndex: 100,
      }}
    >
      <Avatar
        src={data?.personal_details?.card_theme?.hero_bg_image}
        sx={{
          width: "200px",
          height: "200px",
          boxShadow: "0px 0px 4px 2px #2222224c",
        }}
      />
      <CustomTypography
        sx={{
          paddingTop: "42px",
          paddingBottom: "12px",
          textAlign: "center",
          fontSize: useFluidTypography("24px"),
          margin: "0 auto",
        }}
        color={"white"}
      >
        {data?.personal_details?.center_name}
      </CustomTypography>
      <Divider
        color={"white"}
        sx={{
          width: "100%",
        }}
      />
      {data?.personal_details?.displayName?.map((e, idx) => (
        <CustomTypography
          key={idx}
          color={"white"}
          fontSize={"1.1rem"}
          textAlign={"center"}
          sx={{
            paddingTop: "12px",
            flexWrap: "wrap",
            color: "#ffffff",
            justifyContent: "center",
            "& > span": {
              color: grey["200"],
              flexWrap: "nowrap",
              cursor: "pointer",
              marginLeft: "4px",
            },
          }}
        >
          {capitalizeSentence(e?.value)}&nbsp;
          {e.designation && <i>{`(${capitalizeSentence(e.designation)})`}</i>}
        </CustomTypography>
      ))}
      <Button
        variant={"outlined"}
        sx={{
          margin: "auto 0px",
          borderColor: "white",
          color: "white",
        }}
      >
        <CustomTypography
          textTransform={"none"}
          onClick={() => {
            document
              .querySelector(".preview_contact")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Contact Us
        </CustomTypography>
      </Button>
    </Container>
  );
};

export default HomePreview;

const Container = styled("div")({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "32px 24px",
  position: "relative",
  top: 0,
  alignItems: "center",
});
