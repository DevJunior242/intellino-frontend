import React from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import ClubAdminDashboard from "./ClubAdminDashboard";
import InstructorDashboard from "./InstructorDashboard";
import ParentDashboard from "./ParentDashboard";
import { UseAuth } from "../../Api/AuthContext";
import StudentDashboard from "./StudentDashboard";
import SecretaireDashboard from "./SecretaireDashboard";
function GlobalRole() {
  const { auth, activeRole } = UseAuth();

  const isSuperAdmin = auth.roleSuperAdmin?.includes("super_admin");
  console.log("isSuperAdmin:", isSuperAdmin);
  return (
    <div>
      {isSuperAdmin && <SuperAdminDashboard />}
      {!isSuperAdmin && activeRole === "admin_club" && <ClubAdminDashboard />}
      {!isSuperAdmin && activeRole === "instructeur" && <InstructorDashboard />}
      {!isSuperAdmin && activeRole === "secretaire" && <SecretaireDashboard />}
      {!isSuperAdmin && activeRole === "parent" && <ParentDashboard />}
      {!isSuperAdmin && activeRole === "karateka" && <StudentDashboard />}
    </div>
  );
}

export default GlobalRole;
