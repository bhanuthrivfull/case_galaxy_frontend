import React from "react";
import { CircularProgress } from "@mui/material";
const LoadingPage = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 w-100">
      <CircularProgress size={60} color="primary" />
    </div>
  );
};

export default LoadingPage;
