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
import AdminFederationDashboard from "../../Saas/pages/Fede/AdminFederationDashboard";

function GlobalRole() {
  const { auth, activeRole, activeType } = UseAuth();

  // 1. Mode Dieu : Sécurisation du Super Admin
  const isSuperAdmin = auth?.roleSuperAdmin?.includes("super_admin");

  // 2. Sécurisation de la casse (toLowerCase et trim pour éviter les espaces vides)
  const contextType = activeType ? activeType.trim().toLowerCase() : "";
  const roleName = activeRole ? activeRole.trim().toLowerCase() : "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* --- 1. SUPER ADMIN --- */}
      {isSuperAdmin && <SuperAdminDashboard />}

      {/* --- 2. CONTEXTE : CLUB --- */}
      {!isSuperAdmin && contextType === "club" && (
        <>
          {roleName === "admin" && <ClubAdminDashboard />}
          {roleName === "instructeur" && <InstructorDashboard />}
          {roleName === "secretaire" && <SecretaireDashboard />}
          {roleName === "karateka" && <StudentDashboard />}
        </>
      )}

      {/* --- 3. CONTEXTE : LIGUE / LEAGUE --- */}
      {!isSuperAdmin &&
        (contextType === "ligue" || contextType === "league") && (
          <>
            {roleName === "admin" && <AdminLeagueDashboard />}
            {roleName === "secretaire" && <SecretaireDashboard />}
            {roleName === "arbitre" && <ArbitreDashboard />}
          </>
        )}

      {/* --- 4. CONTEXTE : FÉDÉRATION ---
          Le rôle "dtn" (directeur technique national) réutilise le même
          dashboard que "admin" : aucune vue distincte n'existe pour ce rôle. */}
      {!isSuperAdmin && contextType === "federation" && (
        <>
          {(roleName === "admin" || roleName === "dtn") && (
            <AdminFederationDashboard />
          )}
          {roleName === "arbitre" && <ArbitreDashboard />}
        </>
      )}

      {/* --- 5. CAS PARTICULIER (HORS STRUCTURE) --- */}
      {!isSuperAdmin && roleName === "parent" && <ParentDashboard />}
    </Box>
  );
}
export default GlobalRole;
