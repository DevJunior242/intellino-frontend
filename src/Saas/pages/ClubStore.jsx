import React, { useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
  Grid,
} from "@mui/material";
import { motion } from "motion/react";
import { Instance } from "../../Api/Axios";
import { useState } from "react";
import ErrorGlobal from "../../component/ErrorGlobal";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../Api/AuthContext";
import Message from "./Message";
import ConfigSkeleton from "./ConfigSkeleton";

function ClubStore() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const { switchPortal, updateAuth } = UseAuth();
  const [disciplines, setDisciplines] = useState([]);
  const [selectDiscipline, setSelectDiscipline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    discipline_id: "",
    logo: "",
    country: "",
    city: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  //fetch disciplines from api/disciplines
  const fetchDisciplines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Instance.get("/api/disciplines");
      setDisciplines(response.data.disciplines || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  useEffect(() => {
    if (selectDiscipline) {
      setFormData((prev) => ({ ...prev, discipline_id: selectDiscipline.id }));
    }
  }, [selectDiscipline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);
    const formDataInitial = new FormData();
    formDataInitial.append("name", formData.name);
    formDataInitial.append("phone", formData.phone);
    formDataInitial.append("logo", formData.logo);
    formDataInitial.append("country", formData.country);
    formDataInitial.append("city", formData.city);
    formDataInitial.append("address", formData.address);
    formDataInitial.append("discipline_id", formData.discipline_id);
    try {
      const response = await Instance.post(
        "/api/clubs/clubs",
        formDataInitial,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      if (response?.data?.success) {
        const { user, clubs, new_club } = response.data;

        // 1. Extraire les noms des rôles pour le State (Format: ["admin_club"])
        // On cherche les rôles dans le premier club car c'est celui qu'on vient de créer
        const extractedRoles = user.clubs[0].roles.map((r) => r.name);

        // 2. Mettre à jour l'authentification globale
        // On passe les rôles extraits pour écraser l'ancien tableau vide
        updateAuth({
          user: user,
          clubs: clubs,
          role: extractedRoles,
        });

        // 3. Forcer le rôle actif sur le nouveau club
        switchPortal(new_club.id, new_club.type, new_club.role);
        //reset form
        setSelectDiscipline(null);
        setFormData({
          name: "",
          phone: "",
          discipline: "",
          logo: "",
          country: "",
          city: "",
          address: "",
        });
        setSuccess(
          "votre club a été créé avec succès.rendez vous dans le dashboard pour y accéder",
        );

        setError({});
      } else {
        setError({ general: response.data.message });
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <ConfigSkeleton />;
  return (
    <Container maxWidth="md">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{
          mb: 8,
          mt: 2,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
          backgroundColor: "background.default",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          textAlign="center"
          sx={{ fontWeight: "bold", fontSize: { xs: 18, md: 24 }, mb: 2 }}
        >
          page de création de club
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          {/* ── Grid 2 colonnes sur desktop, 1 sur mobile ── */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                error={hasError("name")}
                helperText={getError("name")}
                id="name"
                name="name"
                label="Name"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                value={formData.name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                error={hasError("phone")}
                helperText={getError("phone")}
                id="phone"
                name="phone"
                label="Phone"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                value={formData.phone}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                slotProps={{
                  paper: {
                    sx: { backgroundColor: "background.default" },
                  },
                }}
                disablePortal
                options={Array.isArray(disciplines) ? disciplines : []}
                getOptionLabel={(disciplines) => `${disciplines?.name || ""}`}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
                value={selectDiscipline}
                onChange={(e, newValue) => setSelectDiscipline(newValue)}
                renderInput={(params) => (
                  <TextField
                    error={hasError("discipline_id")}
                    helperText={getError("discipline_id")}
                    {...params}
                    fullWidth
                    label="discipline"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                error={hasError("country")}
                helperText={getError("country")}
                id="country"
                name="country"
                label="Country"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                value={formData.country}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                error={hasError("city")}
                helperText={getError("city")}
                id="city"
                name="city"
                label="City"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                value={formData.city}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                error={hasError("address")}
                helperText={getError("address")}
                id="address"
                name="address"
                label="Address"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                value={formData.address}
              />
            </Grid>

            <Grid item xs={12}>
              <label htmlFor="logo">
                <Typography
                  variant="h6"
                  component="span"
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
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ p: 2, textTransform: "none" }}
              disabled={submitting}
            >
              {submitting ? "chargement..." : "créer un club"}
            </Button>
            {/* </Grid> */}
          </Grid>
        </form>
      </Box>
    </Container>
  );
}

export default ClubStore;
