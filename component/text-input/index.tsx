import {
  FormControl,
  FormControlProps,
  FormLabel,
  FormLabelProps,
  styled,
  TextField,
  TextFieldProps,
} from "@mui/material";
import useFluidTypography from "@/hooks/fluid-typo";
import React from "react";
import CustomTypography from "../typography";

type TextInputProps = {
  input: TextFieldProps;
  label?: FormLabelProps;
  formProps?: FormControlProps;
  endButton?: boolean | React.ReactNode;
};

const CustomTextInput = ({ ...props }: TextInputProps): React.ReactNode => {
  const labelSize = useFluidTypography("1.2rem");
  return (
    <StyledFormControl {...props?.formProps}>
      {props?.input?.label && (
        <>
          <FormLabel
            htmlFor={props.input?.id}
            style={{
              fontSize: labelSize,
              fontWeight: 500,
              ...props?.label?.style,
            }}
            {...props?.label}
          >
            <CustomTypography variant={"body2"} textTransform={"none"}>
              {props.input?.label}
            </CustomTypography>
          </FormLabel>
        </>
      )}
      <TextField
        className={"input"}
        type={"text"}
        fullWidth
        size="medium"
        variant={"outlined"}
        aria-autocomplete="both"
        aria-haspopup="false"
        autoCapitalize="off"
        autoComplete={"false"}
        autoSave="off"
        {...props.input}
        inputProps={{
          ...props.input.inputProps,
        }}
        style={{
          ...props.input.style,
        }}
        sx={{
          fontSize: useFluidTypography("1rem"),
          "& input": {
            borderRadius: "12px",
          },
          ...props.input.sx,
        }}
        label={undefined}
      />
    </StyledFormControl>
  );
};

export default CustomTextInput;

const StyledFormControl = styled(FormControl)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
});
