import { CircularProgress, Dialog } from "@mui/material";
import { blue } from "@mui/material/colors";

const Loader = () => {
  return (
    <Dialog
      open={true}
      sx={{
        ".MuiPaper-root": {
          padding: "12px",
        },
      }}
    >
      <CircularProgress
        variant="indeterminate"
        size={"32px"}
        color="success"
        sx={{
          background: "none",
          color: blue["400"],
        }}
      />
    </Dialog>
  );
};

export default Loader;
