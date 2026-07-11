import { Box } from "@mui/material";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import LoadingScreen from "../LoadingScreen";

function LayoutAuth() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}

export default LayoutAuth;
