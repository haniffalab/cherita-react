import { Box, LinearProgress, CircularProgress } from "@mui/material";

export const LoadingSpinner = ({ text = null, disableShrink = false }) => {
  return (
    <div className="loading-spinner">
      <CircularProgress disableShrink={disableShrink} />
      {text?.length && <span className="visually-hidden">{text}</span>}
    </div>
  );
};

export const LoadingLinear = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgress />
    </Box>
  );
};