import { Box } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

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
        <Outlet />
      </Box>
    </Box>
  );
}

export default LayoutAuth;
