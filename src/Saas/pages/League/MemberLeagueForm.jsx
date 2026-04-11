import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormHelperText,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import PulseLoader from "react-spinners/PulseLoader";
import RoleAutoComplete from "../RoleAutoComplete";

function MemberLeagueForm({ open, handleClose }) {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRole] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const { StoreLeagueUser } = UseAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    role_id: "",
  });
  const getRoles = async () => {
    setIsLoading(true);
    try {
      const response = await Instance.get("api/membres/leagues/getRoles");
      setRole(response.data.roles);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getRoles();
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({
      ...prev,
      role_id: role ? role.id : "",
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);
    try {
      const res = await StoreLeagueUser(formData);
      console.log(res);
      if (res.success) {
        alert("Compte créé avec succès !");
        setFormData({
          fullname: "",
          email: "",
          phone: "",
          password: "",
          password_confirmation: "",
          role_id: "",
        });
        setSuccess(res.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
      } else {
        alert("Erreur lors de la création de compte");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <PulseLoader />
      </Box>
    );
  }
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un membre</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {error && (
          <Message
            text={error.general}
            type="error"
            className="mb-4 text-center"
          />
        )}
        {success && (
          <Message text={success} type="success" className="mb-4 text-center" />
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            error={!!error.fullname}
            id="fullname"
            name="fullname"
            label="nom complet"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.fullname}
            onChange={handleChange}
          />
          {error.fullname && (
            <FormHelperText error>{error.fullname.join(", ")}</FormHelperText>
          )}
          <TextField
            error={!!error.email}
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {error.email && (
            <FormHelperText error>{error.email.join(", ")}</FormHelperText>
          )}
          <TextField
            error={!!error.phone}
            id="phone"
            name="phone"
            label="Phone"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {error.phone && (
            <FormHelperText error>{error.phone.join(", ")}</FormHelperText>
          )}

          <RoleAutoComplete
            label="Rôle"
            value={selectedRole}
            onChange={handleRoleChange}
            required
            hasError={hasError}
            getError={getError}
          />
          <Button
            disabled={submitting}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            {submitting && <CircularProgress size={20} />}
            {!submitting && "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MemberLeagueForm;
