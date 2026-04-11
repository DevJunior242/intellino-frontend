import { useEffect, useCallback, useState } from "react";
import { Autocomplete, TextField, FormHelperText } from "@mui/material";
import { Instance } from "../../Api/Axios";

const RoleAutoComplete = ({
  value,
  onChange,
  hasError,
  getError,
  label = "Choisir un élève",
}) => {
  const [roles, setRole] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const getRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get("api/roles");
      console.log(response);
      setRole(response.data.roles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getRoles();
  }, [getRoles]);

  return (
    <>
      <Autocomplete
        disablePortal
        loading={isLoading}
        options={Array.isArray(roles) ? roles : []}
        getOptionLabel={(role) => role?.name ?? ""}
        value={value}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        onChange={(e, newValue) => onChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            margin="normal"
            label={label}
            required
            error={hasError("role_id")}
            helperText={getError("role_id")}
          />
        )}
      />
    </>
  );
};

export default RoleAutoComplete;
