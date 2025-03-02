import { Button, styled } from "@mui/material";
import CustomIcon from "@/component/icons";
import CustomTextInput from "@/component/text-input";
import CustomTypography from "@/component/typography";
import { SERVER_DOMAIN } from "@/constants/value";
import { useAppSelector } from "@/redux/store/hook";
import { successToast } from "@/utils/toast";
import React from "react";
import Link from "next/link";

const ContactPreview = () => {
  const contact = useAppSelector(
    (s) => s?.card?.card_data?.["contact"] ?? null
  );
  const domain = useAppSelector((s) => s.card.current_staff);
  const theme = useAppSelector(
    (s) => s?.card?.card_data?.["personal_details"]?.card_theme
  );
  const url = `${
    process.env.NODE_ENV === "development" ? "http://" : "https://"
  }${domain?.data?.assigned_subdomain}.${SERVER_DOMAIN}`;
  return (
    <Container
      className="scrollbar"
      id={"contact"}
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
          Contact
        </CustomTypography>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingTop: "24px",
          paddingBottom: "32px",
        }}
      >
        <Row>
          {contact?.phone?.map((e, i) => {
            return (
              <React.Fragment key={i}>
                <CustomIcon
                  name={"LUCIDE_ICONS"}
                  icon="LuPhone"
                  size={24}
                  color={theme?.accent_color}
                  sx={{
                    opacity: i === 0 ? 1 : 0,
                  }}
                />
                <CustomTypography
                  sx={{
                    "& *": {
                      color: "inherit",
                      textDecoration: "none",
                    },
                  }}
                >
                  <Link href={`tel:+91${e}`}>{e}</Link>
                </CustomTypography>
              </React.Fragment>
            );
          })}
        </Row>
        <Row>
          {contact?.address && (
            <>
              <CustomIcon
                name={"FONT_AWESOME_6"}
                icon="FaAddressCard"
                size={24}
                color={theme?.accent_color}
              />
              <CustomTypography>{contact?.address}</CustomTypography>
            </>
          )}
        </Row>
      </div>
      <ShareContainer
        sx={{
          border: `2px solid ${theme?.accent_color}`,
          padding: "12px 16px",
          borderRadius: "12px",
        }}
      >
        <CustomTypography fontWeight={"bold"}>Share url</CustomTypography>
        <CustomTextInput
          input={{
            value: url,
            slotProps: {
              input: {
                endAdornment: (
                  <Button
                    onClick={async () => {
                      await window.navigator.clipboard.writeText(url);

                      successToast("Copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                ),
              },
            },
          }}
        />
      </ShareContainer>
    </Container>
  );
};

export default ContactPreview;

const Container = styled("div")({
  width: "100%",
  height: "100%",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  padding: "0px 32px",
  position: "relative",
  paddingBottom: "16px",
  maxWidth: "calc(100% - 32px)",
  margin: "auto",

  top: 0,
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

const Row = styled("div")({
  width: "100%",
  display: "grid",
  gridTemplateColumns: "40px 1fr",
  gap: "12px",
});

const ShareContainer = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});
