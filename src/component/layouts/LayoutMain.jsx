import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import Navbar from "../Navbar";
import { Box } from "@mui/material";
import TopBar from "../../Header/Topbar";

function LayoutMain() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

export default LayoutMain;
