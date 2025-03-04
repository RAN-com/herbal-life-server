import { Avatar, Button, Dialog, Divider, Modal, styled } from "@mui/material";
import { grey } from "@mui/material/colors";
import CustomTypography from "@/component/typography";
import useFluidTypography from "@/hooks/fluid-typo";
import { useAppSelector } from "@/redux/store/hook";
import { capitalizeSentence } from "@/utils/functions";
import CustomIcon from "../icons";
import Link from "next/link";
import React from "react";
import CustomTextInput from "../text-input";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";
import { createAppointment } from "@/firebase/appointments";
import { errorToast, successToast } from "@/utils/toast";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string()
    .matches(/^\d+$/, "Only numbers allowed")
    .min(10, "Mobile must be at least 10 digits")
    .required("Mobile is required"),
  date: Yup.date().required("Date is required"),
});
const MSG_TEMPLATE =
  "Hi, I’m interested in learning more about your nutrition services!";
const HomePreview = () => {
  const data = useAppSelector((s) => s.card.card_data);
  const staff = useAppSelector((s) => s.card.current_staff);

  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      date: moment().toString() as string,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      console.log(values);
      const create = await createAppointment(staff?.data?.sid as string, {
        ...values,
        appointment_date: values.date,
        assigned_to: {
          sid: staff?.data?.sid as string,
        },
      });

      setShowForm(false);
      setLoading(false);

      if (create.data && create.success) {
        successToast(create.message);
      } else {
        errorToast(create.message);
      }
    },
  });
  return (
    <>
      <Modal open={loading}>
        <div></div>
      </Modal>
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        sx={{
          ".MuiPaper-root": {
            width: "calc(100% - 32px)",
            maxWidth: "420px",
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px",
          },
        }}
      >
        <div
          style={{
            flexDirection: "row",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "16px",
          }}
        >
          <CustomTypography fontWeight={"600"}>
            Book an Appointment
          </CustomTypography>
          <CustomIcon
            name={"LUCIDE_ICONS"}
            icon="LuX"
            onClick={() => setShowForm(false)}
            color={data?.personal_details?.card_theme?.accent_color}
          />
        </div>
        <div
          style={{
            gap: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CustomTextInput
            input={{
              size: "small",
              label: "Name",
              placeholder: "Enter your name",
              onChange: (e) => formik.setFieldValue("name", e.target.value),
              error: (
                formik.touched.name && Boolean(formik.errors.name)
              )?.valueOf(),
              helperText: formik.touched.name && formik.errors.name,
            }}
          />
          <CustomTextInput
            input={{
              size: "small",
              label: "Contact Number",
              placeholder: "Enter your phone number",
              onChange: (e) => formik.setFieldValue("phone", e.target.value),
              error: (
                formik.touched.phone && Boolean(formik.errors.phone)
              )?.valueOf(),
              helperText: formik.touched.phone && formik.errors.phone,
            }}
          />
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              onChange={(e) => formik.setFieldValue("date", e?.toISOString())}
              name={"date"}
              disablePast={true}
              disableHighlightToday={true}
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  error: (
                    formik.touched.date && Boolean(formik.errors.date)
                  )?.valueOf(),
                  helperText: formik.touched.date && formik.errors.date,
                },
              }}
              value={formik.values.date ? moment(formik.values.date) : moment()}
            />
          </LocalizationProvider>
          <Button
            onClick={() => formik.submitForm()}
            variant="contained"
            disableElevation
            disableFocusRipple
            disableRipple
            disableTouchRipple
            sx={{
              backgroundColor: data?.personal_details?.card_theme?.accent_color,
              margin: "12px 0px",
              "&:hover": {
                backgroundColor:
                  data?.personal_details?.card_theme?.accent_color + "dd",
              },
              textTransform: "none",
            }}
          >
            <CustomTypography fontWeight={"400"}>Submit</CustomTypography>
          </Button>
        </div>
      </Dialog>
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
            borderRadius: "0px 0px 24px 24px",
            zIndex: -1,
          },
          zIndex: 100,
        }}
      >
        <Avatar
          src={data?.personal_details?.center_logo}
          sx={{
            width: "120px",
            height: "120px",
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
        {data?.personal_details?.displayName?.map((e) => (
          <CustomTypography
            key={e.value}
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
        <SocialContainer>
          <LinkContainer>
            {data?.personal_details?.whatsapp && (
              <Link
                href={`https://wa.me/91${data?.personal_details?.whatsapp}?&text=${MSG_TEMPLATE}`}
                target="_blank"
              >
                <CustomIcon
                  name={"IONICONS5"}
                  icon="IoLogoWhatsapp"
                  color={"white"}
                  sx={{
                    backgroundColor:
                      data?.personal_details?.card_theme?.accent_color,
                    padding: "8px",
                    borderRadius: "12px",
                  }}
                />
              </Link>
            )}
            {data?.personal_details?.email && (
              <Link
                href={`mailto://${data?.personal_details?.email}`}
                target="_blank"
              >
                <CustomIcon
                  name={"MATERIAL_DESIGN"}
                  icon="MdEmail"
                  color={"white"}
                  sx={{
                    backgroundColor:
                      data?.personal_details?.card_theme?.accent_color,
                    padding: "8px",
                    borderRadius: "12px",
                  }}
                />
              </Link>
            )}
            {data?.personal_details?.map_embed && (
              <Link href={data?.personal_details?.map_embed} target="_blank">
                <CustomIcon
                  name={"FONT_AWESOME"}
                  icon="FaDirections"
                  color={"white"}
                  sx={{
                    backgroundColor:
                      data?.personal_details?.card_theme?.accent_color,
                    padding: "8px",
                    borderRadius: "12px",
                  }}
                />
              </Link>
            )}
          </LinkContainer>
          <Button
            onClick={() => setShowForm(true)}
            variant="contained"
            disableElevation
            disableFocusRipple
            disableRipple
            disableTouchRipple
            sx={{
              backgroundColor: data?.personal_details?.card_theme?.accent_color,
              margin: "12px 0px",
              "&:hover": {
                backgroundColor:
                  data?.personal_details?.card_theme?.accent_color + "dd",
              },
              textTransform: "none",
            }}
          >
            <CustomTypography variant="h6" fontWeight={"400"}>
              Book Now
            </CustomTypography>
          </Button>
        </SocialContainer>
      </Container>
    </>
  );
};

export default HomePreview;

const Container = styled("div")({
  width: "100%",
  height: "100%",
  minHeight: "600px",
  maxHeight: "auto",
  display: "flex",
  flexDirection: "column",
  padding: "32px 24px",
  paddingBottom: "16px",
  position: "relative",
  top: 0,
  alignItems: "center",
  borderRadius: "0px 0px 24px 24px",
  backgroundColor: "white",
});

const SocialContainer = styled("div")({
  width: "max-content",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "auto auto",
  gap: 16,
});

const LinkContainer = styled("div")({
  width: "auto",
  height: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
});
