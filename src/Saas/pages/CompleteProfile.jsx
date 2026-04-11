import {
  Box,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { UseAuth } from "../../Api/AuthContext";
import { useEffect } from "react";
import { Instance } from "../../Api/Axios";
function CompleteProfile() {
  const { user, completeProfile } = UseAuth();
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [selectRole, setSelectRole] = useState([]);
  const [formData, setFormData] = useState({
    roles: [],
  });

  const getRoles = async () => {
    try {
      setLoading(true);
      const res = await Instance.get("api/roles");
      console.log(res);
      setRoles(res.data.data || []);
    } catch (error) {
      console.log(error);
      setError({ general: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    const newRoles = Array.isArray(value) ? value : [value];
    setSelectRole(newRoles);
    setFormData((prev) => ({ ...prev, roles: newRoles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    if (formData.roles.length === 0) {
      setError({ roles: "please select at least one role" });
      return;
    }
    try {
      const result = await completeProfile(formData);
      console.log(result);
      setSuccess(true);
    } catch (error) {
      console.log(error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          const arrayErrors = Object.keys(data.errors).reduce((acc, key) => {
            acc[key] = Array.isArray(data.errors[key])
              ? data.errors[key]
              : [data.errors[key]];
            return acc;
          }, {});
          setError(arrayErrors);
          console.warn(arrayErrors);
        } else {
          setError({ general: [data.message || " Something went wrong"] });
          console.warn(data);
        }
      } else {
        setError({ general: [error.message] });
      }
    }
  };

  const MenuProps = {
    PaperProps: {
      sx: {
        backgroundColor: "background.default",
      },
    },
  };
  if (loading) return <div>Loading...</div>;
  return (
    <Container maxWidth="xs">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 8,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h4" component={"h1"} textAlign={"center"}>
          Complete Profile
        </Typography>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error.general && (
          <Typography textAlign={"center"} color={"red"}>
            {error.general}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth error={!!error.roles}>
            <InputLabel id="role-id">choisir des Roles</InputLabel>
            <Select
              multiple
              labelId="role-id"
              name="roles"
              value={selectRole}
              onChange={handleChange}
              input={<OutlinedInput label="roles" />}
              renderValue={(selected) =>
                roles
                  .filter((role) => selected.includes(role.id))
                  .map((role) => role.name)
                  .join(", ")
              }
              MenuProps={MenuProps}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Checkbox checked={selectRole.includes(role.id)} />
                  <ListItemText primary={role.name} />{" "}
                </MenuItem>
              ))}
            </Select>
            {error.roles && (
              <FormHelperText error>{error.roles}</FormHelperText>
            )}
          </FormControl>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            valider
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default CompleteProfile;
