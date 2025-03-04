import { Button, styled } from "@mui/material";
import { CardData } from "@/types/card";
import CustomTypography from "../typography";
import { grey } from "@mui/material/colors";
import { useAppSelector } from "@/redux/store/hook";

type Props = CardData["services"][number] & {
  onClick?(): void;
};
const ServiceCard = ({
  title,
  subtitle,
  photo_url,
  description,
  onClick,
}: Props) => {
  const data = useAppSelector(
    (s) => s.card.card_data?.personal_details?.card_theme
  );

  return (
    <Container onClick={onClick}>
      <CustomTypography fontWeight={"bold"} variant={"h6"}>
        {title}
      </CustomTypography>
      <CustomTypography variant={"body2"} color={grey["400"]}>
        {subtitle} asdf
      </CustomTypography>
      <div className="img_container">
        {/* 
            eslint-disable-next-line @next/next/no-img-element
            */}
        <img
          src={photo_url}
          alt={title}
          style={{ width: "100%", objectFit: "cover" }}
          width={200}
          height={200}
        />
      </div>
      <CustomTypography variant={"body2"}>{description}</CustomTypography>
      <Button
        variant="contained"
        disableElevation
        disableFocusRipple
        disableRipple
        disableTouchRipple
        sx={{
          backgroundColor: data?.accent_color,
          margin: "12px 0px",
          "&:hover": {
            backgroundColor: data?.accent_color + "dd",
          },
        }}
      >
        Enquire Now
      </Button>
    </Container>
  );
};

export default ServiceCard;

const Container = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "4px 16px",
  boxShadow: "0px 0px 1px 0px blue",
  borderRadius: "12px",
  ".img_container": {
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden",
    backgroundColor: "#d3d3d3",
    borderRadius: "12px",
    margin: "12px 0px",
    "& img": {
      width: "100%",
      height: "100%",
    },
  },
});
