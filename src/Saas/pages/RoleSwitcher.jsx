import React from "react";
import { UseAuth } from "../../Api/AuthContext";
 


const RoleSwitcher = () => {
  const { auth, activeRole, switchRole } = UseAuth();

   if (!auth.role || auth.role.length <= 1) return null;

  return (
    <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
      <label
        style={{
          fontSize: "12px",
          color: "#666",
          display: "block",
          marginBottom: "5px",
        }}
      >
        Espace de travail :
      </label>
      <select
        value={activeRole}
        onChange={(e) => switchRole(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          backgroundColor: activeRole === "admin_club" ? "#e3f2fd" : "#f1f8e9",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {auth.role.map((r) => (
          <option key={r} value={r}>
            {r === "admin_club"
              ? " Administration"
              : r === "parent"
              ? " Espace Parent"
              : r === "etudiant"
              ? " Espace Élève"
              : r}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSwitcher;
