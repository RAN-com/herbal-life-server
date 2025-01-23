import Typography, { TypographyProps } from "@mui/material/Typography";
import useFluidTypography from "@/app/hooks/fluid-typo";
import { capitalizeSentence } from "@/app/utils/functions";
import React from "react";

type Props = TypographyProps & {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "caption"
    | "button"
    | "overline"
    | "srOnly"
    | "inherit";
  fontSize?: string;
  error?: boolean;
};

const CustomTypography = ({ ...props }: Props): React.ReactNode => {
  const size = useFluidTypography(`${props.fontSize}` || "16px");

  return (
    <Typography
      fontSize={size}
      {...props}
      sx={{
        display: "flex",
        alignItems: "center",
        span: {
          fontWeight: "normal",
        },
        ...props.sx,
      }}
    >
      {typeof props.children === "string"
        ? capitalizeSentence(props.children.toLowerCase().split("_").join(" "))
        : props.children}
    </Typography>
  );
};

export default CustomTypography;
