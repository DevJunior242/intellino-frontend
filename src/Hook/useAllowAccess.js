import { UseAuth } from "../Api/AuthContext";

export const useAllowAccess = () => {
  const { activeRole } = UseAuth();

  const allowedRoles = ["admin", "instructeur", "secretaire"];
  const allowAccess = allowedRoles.includes(activeRole);

  return { allowAccess };
};
