import { UseAuth } from "../Api/AuthContext";

export const useAllowAccess = () => {
  const { activeRole } = UseAuth();

  const allowedRoles = ["admin_club", "instructeur", "secretaire"];
  const allowAccess = allowedRoles.includes(activeRole);

  return { allowAccess };
};
