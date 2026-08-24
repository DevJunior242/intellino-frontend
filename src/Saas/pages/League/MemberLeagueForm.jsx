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
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import PulseLoader from "react-spinners/PulseLoader";
import RoleAutoComplete from "../RoleAutoComplete";
import ConfigSkeleton from "../ConfigSkeleton";

function MemberLeagueForm({ open, handleClose, getMembers }) {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRole] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const { StoreLeagueUser, StoreFederationUser, activeId, activeType } = UseAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    role_id: "",
  });
  const getRoles = async () => {
    setLoading(true);
    try {
      const response = await Instance.get(`api/roles`);
      setRole(response.data.roles || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);
    try {
      const res =
        activeType === "Federation"
          ? await StoreFederationUser(formData)
          : await StoreLeagueUser(formData);
      console.log(res);
      if (res.success) {
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
        getMembers();
      } else {
        alert("Erreur lors de la création de compte");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

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
          <FormControl fullWidth error={hasError("role_id")} required>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              name="role_id"
              value={formData.role_id}
              label="Role"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role_id: e.target.value,
                })
              } // MenuProps={{
              //   PaperProps: {
              //     sx: { backgroundColor: "background.default" },
              //   },
              // }}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Chargement...
                </MenuItem>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.display_name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  Aucun role trouvé
                </MenuItem>
              )}
            </Select>
            {hasError("role_id") && (
              <FormHelperText>{getError("role_id")}</FormHelperText>
            )}
          </FormControl>

          <Button
            disabled={submitting}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            {submitting ? <CircularProgress size={20} /> : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MemberLeagueForm;
