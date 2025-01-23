import { styled } from "@mui/material";
import { CardData } from "@/app/types/card";
import CustomTypography from "../typography";
import { grey } from "@mui/material/colors";

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
  return (
    <Container onClick={onClick}>
      <CustomTypography fontWeight={"bold"} variant={"h6"}>
        {title}
      </CustomTypography>
      <CustomTypography variant={"body2"} color={grey["400"]}>
        {subtitle} asdf
      </CustomTypography>
      <div className="img_container">
        <img
          src={
            typeof photo_url === "string"
              ? photo_url
              : URL.createObjectURL(photo_url)
          }
          alt={title}
        />{" "}
      </div>
      <CustomTypography variant={"body2"}>{description}</CustomTypography>
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
      objectFit: "contain",
    },
  },
});
