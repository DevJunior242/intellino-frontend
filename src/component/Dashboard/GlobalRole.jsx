import React from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import ClubAdminDashboard from "./ClubAdminDashboard";
import InstructorDashboard from "./InstructorDashboard";
import ParentDashboard from "./ParentDashboard";
import { UseAuth } from "../../Api/AuthContext";
import StudentDashboard from "./StudentDashboard";
import SecretaireDashboard from "./SecretaireDashboard";
import { Box } from "@mui/material";
import AdminLeagueDashboard from "../League/AdminLeagueDashboard";
import ArbitreDashboard from "./ArbitreDashboard";
function GlobalRole() {
  const { auth, activeRole } = UseAuth();

  const isSuperAdmin = auth.roleSuperAdmin?.includes("super_admin");
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {isSuperAdmin && <SuperAdminDashboard />}
      {!isSuperAdmin && activeRole === "admin_club" && <ClubAdminDashboard />}
      {!isSuperAdmin && activeRole === "instructeur" && <InstructorDashboard />}
      {!isSuperAdmin && activeRole === "secretaire" && <SecretaireDashboard />}
      {!isSuperAdmin && activeRole === "parent" && <ParentDashboard />}
      {!isSuperAdmin && activeRole === "karateka" && <StudentDashboard />}
      {/* ligue */}
      {!isSuperAdmin && activeRole === "admin_league" && (
        <AdminLeagueDashboard />
      )}
      {!isSuperAdmin && activeRole === "arbitre_league" && <ArbitreDashboard />}
    </Box>
  );
}

export default GlobalRole;
