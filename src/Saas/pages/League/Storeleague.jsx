import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import PulseLoader from "react-spinners/PulseLoader";

function Storeleague() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { switchRole, updateAuth } = UseAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    logo: "",
  });

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);
    const formDataInitial = new FormData();
    formDataInitial.append("name", formData.name);
    formDataInitial.append("phone", formData.phone);
    formDataInitial.append("logo", formData.logo);

    try {
      const response = await Instance.post(
        "/api/leagues/leagues",
        formDataInitial,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log(response);
      if (response?.data?.success) {
        const { user, memberships, new_league } = response.data;

        // 1. Extraire les noms des rôles pour le State (Format: ["admin_club"])
        // On cherche les rôles dans le premier club car c'est celui qu'on vient de créer
        const extractedRoles = user.leagues[0].roles.map((r) => r.name);

        // 2. Mettre à jour l'authentification globale
        // On passe les rôles extraits pour écraser l'ancien tableau vide
        updateAuth({
          user: user,
          memberships: memberships,
          role: extractedRoles,
        });

        // 3. Forcer le rôle actif sur le nouveau club
        switchRole(new_league.id, new_league.role);
        //reset form
        setFormData({
          name: "",
          phone: "",

          logo: "",
        });
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError({ general: response.data.message });
        setSuccess(false);
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Container maxWidth="sm">
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
        <Typography
          variant="h4"
          component={"h1"}
          textAlign={"center"}
          sx={{ fontWeight: "bold", fontSize: { xs: 8, md: 14 } }}
        >
          Espace de League
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <TextField
            error={hasError("name")}
            helperText={getError("name")}
            id="name"
            name="name"
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.name}
            required
          />

          <TextField
            error={hasError("phone")}
            helperText={getError("phone")}
            id="phone"
            name="phone"
            label="Phone"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.phone}
            required
          />

          {/* fichier logo */}
          <label htmlFor="logo">
            <Typography
              variant="h6"
              component={"h1"}
              sx={{ fontWeight: "bold" }}
            >
              Logo
            </Typography>
          </label>
          <TextField
            error={hasError("logo")}
            helperText={getError("logo")}
            id="logo"
            type="file"
            accept="image/*"
            name="logo"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          {error.logo && (
            <FormHelperText error>{error.logo.join(", ")}</FormHelperText>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
            disabled={submitting}
          >
            {submitting ? (
              <PulseLoader size={20} color="#fff" />
            ) : (
              "créer une league"
            )}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Storeleague;
