import React, { use, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../SideBar";
import { Box } from "@mui/material";
import { UseAuth } from "../../Api/AuthContext";
import TopBar from "../../Header/Topbar";

function LayoutDashboard() {
  const { auth } = UseAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (auth.role.length === 0) {
      navigate("/");
    }
  }, [auth.role, navigate]);
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideBar />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />

        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default LayoutDashboard;
