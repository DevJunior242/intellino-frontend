import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Save, Security } from "@mui/icons-material";
import React, { useState } from "react";
import ErrorGlobal from "../ErrorGlobal";
import { Instance } from "../../Api/Axios";
import Message from "../../Saas/pages/Message";

function UpdatePassword() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [loading, setLoading] = useState(false);
  // Variables pour stocker les valeurs de l'utilisateur

  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    //try catch pour gérer les erreurs de validation ou de serveur
    try {
      const res = await Instance.put("/api/setting/password", formData);
      if (res.data.success) {
        setSuccess(res.data.message);
        setFormData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        setError(res.data.errors);
        setFormData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      }
    } catch (error) {
      // Gérer les erreurs (ex: afficher les messages d'erreur de validation)
      ErrorGlobal({ error, setError });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Paper
        sx={{width:"100%",backgroundColor:"background.default",p:3}}
    >
      <Typography variant="h6" sx={{ fontSize:{xs:14,md:24} }}>
        <Security /> Changer le mot de passe
      </Typography>
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}

      <form onSubmit={handleUpdatePassword}>
        <TextField
          name="current_password"
          label="Ancien mot de passe"
          type="password"
          fullWidth
          value={formData.current_password}
          onChange={handleChange}
          required
          error={hasError("current_password")}
          helperText={getError("current_password")}
          sx={{ mt: 2, mb: 1 }}
          margin="normal"
        />
        <TextField
          name="password"
          label="Nouveau mot de passe"
          type="password"
          fullWidth
          value={formData.password}
          onChange={handleChange}
          required
          error={hasError("password")}
          helperText={getError("password")}
          sx={{ mt: 2, mb: 1 }}
          margin="normal"
        />
        <TextField
          name="password_confirmation"
          label="Confirmer le nouveau mot de passe"
          type="password"
          fullWidth
          value={formData.password_confirmation}
          onChange={handleChange}
          required
          error={hasError("password_confirmation")}
          helperText={getError("password_confirmation")}
          sx={{ mb: 2 }}
          margin="normal"
        />
        <Button
          type="submit"
          variant="outlined"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          sx={{ mt: 2, textTransform: "none", fontSize:{xs:14,md:24} }}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Paper>
  );
}

export default UpdatePassword;
