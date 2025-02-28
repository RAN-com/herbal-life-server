import * as FA from "react-icons/fa";
import { FaAdn } from "react-icons/fa";
import * as MD from "react-icons/md";
import * as TI from "react-icons/ti";
import * as GI from "react-icons/gi";
import * as IO from "react-icons/io";
import * as IO5 from "react-icons/io5";
import * as RI from "react-icons/ri";
import * as WI from "react-icons/wi";
import * as BS from "react-icons/bs";
import * as HI from "react-icons/hi";
import * as SI from "react-icons/si";
import * as GR from "react-icons/gr";
import * as GO from "react-icons/go";
import * as AI from "react-icons/ai";
import * as BI from "react-icons/bi";
import * as DI from "react-icons/di";
import * as FC from "react-icons/fc";
import * as IM from "react-icons/im";
import * as LU from "react-icons/lu";
import * as FA6 from "react-icons/fa6";
import { styled, useTheme } from "@mui/system";
import { SxProps } from "@mui/material";
import { AllIcons, Icons } from "@/types/icon";
import React from "react";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const chooseIcon = (name: keyof typeof Icons) => {
  switch (name) {
    case "FONT_AWESOME":
      return FA;
    case "MATERIAL_DESIGN":
      return MD;
    case "FONT_AWESOME_6":
      return FA6;
    case "TYPICON":
      return TI;
    case "GAME_ICONS":
      return GI;
    case "IONICONS":
      return IO;
    case "IONICONS5":
      return IO5;
    case "REMIX_ICONS":
      return RI;
    case "WEATHER_ICONS":
      return WI;
    case "BOOTSTRAP_ICONS":
      return BS;
    case "HERO_ICONS":
      return HI;
    case "SIMPLE_ICONS":
      return SI;
    case "GRAPHS_ICONS":
      return GR;
    case "OCTICONS":
      return GO;
    case "AI_ICONS":
      return AI;
    case "BOX_ICONS":
      return BI;
    case "DEV_ICONS":
      return DI;
    case "FLAT_COLOR_ICONS":
      return FC;
    case "MATERIAL_ICONS":
      return IM;
    case "LUCIDE_ICONS":
      return LU;
    default:
      return FA;
  }
};

type Props = {
  name: keyof typeof Icons;
  icon?: AllIcons;
  size?: number;
  color?: string;
  changeCursor?: boolean;
  onClick?(e: React.MouseEvent<HTMLDivElement>): void;
  style?: React.CSSProperties;
  sx?: SxProps;
  disabled?: boolean;
  stopPropagation?: boolean;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  onTouchStart?(event: React.TouchEvent<HTMLDivElement>): void;
};

export type IconPropTypes = Props["icon"];

const Container = styled("div")({});

const CustomIcon = ({
  icon,
  onTouchStart,
  changeCursor = true,
  size = 24,
  name,
  onClick,
  color,
  sx,
  disabled,
  stopPropagation = true,
  className,
}: Props): React.ReactNode => {
  const th = useTheme();
  const choose = chooseIcon(name);
  const Icon = choose[icon as keyof typeof choose] as typeof FaAdn;

  return (
    <Container
      className={
        className
          ? className.toString() + " CustomIconContainer"
          : "CustomIconContainer"
      }
      onClick={(e) => {
        if (stopPropagation) {
          e.stopPropagation();
        }
        onClick?.(e);
      }}
      onTouchStart={onTouchStart}
      sx={{
        ...(disabled
          ? {
              pointerEvents: "none",
              opacity: 0.5,
            }
          : {}),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: changeCursor ? "pointer" : "default",
        transition: "all 0.3s ease-in-out",
        ...sx,
      }}
    >
      <Icon
        className={"CustomIcon"}
        size={size}
        color={th.palette.primary.main}
        style={{
          cursor: changeCursor ? "pointer" : "default",
          transition: "all 0.3s ease-in-out",
          color: color,
        }}
      />
    </Container>
  );
};

export default CustomIcon;
