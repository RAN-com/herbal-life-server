import * as FA from "react-icons/fa";
import * as FA6 from "react-icons/fa6";
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

// eslint-disable-next-line react-refresh/only-export-component
export enum Icons {
  FONT_AWESOME = "FONT_AWESOME",
  FONT_AWESOME_6 = "FONT_AWESOME_6",
  MATERIAL_DESIGN = "MATERIAL_DESIGN",
  TYPICON = "TYPICON",
  GAME_ICONS = "GAME_ICONS",
  IONICONS = "IONICONS",
  IONICONS5 = "IONICONS5",
  REMIX_ICONS = "REMIX_ICONS",
  WEATHER_ICONS = "WEATHER_ICONS",
  BOOTSTRAP_ICONS = "BOOTSTRAP_ICONS",
  HERO_ICONS = "HERO_ICONS",
  SIMPLE_ICONS = "SIMPLE_ICONS",
  GRAPHS_ICONS = "GRAPHS_ICONS",
  OCTICONS = "OCTICONS",
  AI_ICONS = "AI_ICONS",
  BOX_ICONS = "BOX_ICONS",
  DEV_ICONS = "DEV_ICONS",
  FLAT_COLOR_ICONS = "FLAT_COLOR_ICONS",
  MATERIAL_ICONS = "MATERIAL_ICONS",
  LUCIDE_ICONS = "LUCIDE_ICONS",
}

export type AllIcons =
  | keyof typeof FA
  | keyof typeof MD
  | keyof typeof TI
  | keyof typeof GI
  | keyof typeof IO
  | keyof typeof IO5
  | keyof typeof RI
  | keyof typeof WI
  | keyof typeof BS
  | keyof typeof HI
  | keyof typeof SI
  | keyof typeof GR
  | keyof typeof GO
  | keyof typeof AI
  | keyof typeof BI
  | keyof typeof DI
  | keyof typeof FC
  | keyof typeof IM
  | keyof typeof LU
  | keyof typeof FA6;
