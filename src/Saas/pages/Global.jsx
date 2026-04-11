import React from "react";
import { UseAuth } from "../../Api/AuthContext";

function Global() {
  const { auth } = UseAuth();

  return (
    <div>
      {auth.roles.includes("super_admin") && <tout />}
      {auth.roles.includes("admin_club") && <donnee de son club />}
      {auth.roles.includes("Parent") && <parcour de son eleve />}
     
    </div>
  );
}

export default Global;
