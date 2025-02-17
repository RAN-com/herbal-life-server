import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Add Google Font using Next.js Font optimization
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // Load required font weights
  display: "swap",
});

export const theme = responsiveFontSizes(
  createTheme({
    spacing: (factor: number) => `${8 * factor}px`, // Adjust spacing units if needed
    breakpoints: {
      values: {
        xs: 480, // Mobile
        sm: 768, // Tablet
        md: 1024, // Laptop
        lg: 1200, // Desktop
        xl: 1920, // Large Desktop
      },
    },
    direction: "ltr", // Layout direction
    shape: {
      borderRadius: 8, // Rounded corners for components
    },
    transitions: {
      easing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      getAutoHeightDuration: (height: number) =>
        height > 600 ? 500 : height / 2,
    },
    zIndex: {
      mobileStepper: 1000,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
      fab: 1600,
    },
    typography: {
      fontFamily: dmSans.style.fontFamily, // Apply Google Font 'DM Sans' globally
      fontSize: 16, // Base font size
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 700,
        fontSize: "56px",
        lineHeight: 1.167,
      },
      h2: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 700,
        fontSize: "40px",
        lineHeight: 1.2,
      },
      h3: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 700,
        fontSize: "28px",
        lineHeight: 1.167,
      },
      h4: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 700,
        fontSize: "26px",
        lineHeight: 1.235,
      },
      h5: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 700,
        fontSize: "22px",
        lineHeight: 1.334,
      },
      h6: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 700,
        fontSize: "20px",
        lineHeight: 1.6,
      },
      subtitle1: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: 1.75,
      },
      subtitle2: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: 1.57,
      },
      body1: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: 1.5,
      },
      body2: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: 1.43,
      },
      button: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 700,
        fontSize: "14px",
        lineHeight: 1.75,
        textTransform: "uppercase",
      },
      caption: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: 1.66,
      },
      overline: {
        fontFamily: dmSans.style.fontFamily,
        fontWeight: 400,
        fontSize: "10px",
        lineHeight: 2,
      },
      htmlFontSize: 16,
      allVariants: {
        fontFamily: dmSans.style.fontFamily,
      },
    },
  })
);
