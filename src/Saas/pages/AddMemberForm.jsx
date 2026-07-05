import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Paper,
  Grid,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ErrorGlobal from "../../component/ErrorGlobal";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./Message";
import RoleAutoComplete from "./RoleAutoComplete";

const AddMemberForm = ({ onRefresh }) => {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const { activeId, StoreClubMember } = UseAuth();
  console.log("activeId", activeId);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    role_id: "",
    profession: "",
    domicile: "",
    relation: "",
    club_id: activeId,
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({
      ...prev,
      role_id: role ? role.id : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError({});
    //ajouter le club_id
    const AllData = {
      ...formData,
      club_id: activeId,
    };
    try {
      const res = await StoreClubMember(AllData);
      if (res.success) {
        setSuccess(res.message);
        setSelectedRole(null);
        setFormData({
          fullname: "",
          email: "",
          phone: "",
          role_id: "",
          profession: "",
          domicile: "",
          relation: "",
        });

        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
      }
      await onRefresh();
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 600,
        mx: "auto",
        backgroundColor: "background.default",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Ajouter un Membre
      </Typography>
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}

      <Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={hasError("email")}
            helperText={getError("email")}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nom Complet"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
            error={hasError("fullname")}
            helperText={getError("fullname")}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Téléphone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            error={hasError("phone")}
            helperText={getError("phone")}
            margin="normal"
          />

          <RoleAutoComplete
            label="Rôle"
            value={selectedRole}
            onChange={handleRoleChange}
            required
            hasError={hasError}
            getError={getError}
          />

          {/* Animation Framer Motion pour les champs spécifiques au Parent */}
          <AnimatePresence>
            {selectedRole?.name?.toLowerCase() === "parent" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
              >
                <Box sx={{ pt: 2, display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Domicile"
                    name="domicile"
                    value={formData.domicile}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Relation"
                    name="relation"
                    value={formData.relation}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <PulseLoader size={8} /> : "Enregistrer le Membre"}
          </Button>
        </form>
      </Box>
    </Paper>
  );
};

export default AddMemberForm;
