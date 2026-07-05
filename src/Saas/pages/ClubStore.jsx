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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion } from "motion/react";
import { Instance } from "../../Api/Axios";
import { useState } from "react";
import ErrorGlobal from "../../component/ErrorGlobal";
import { UseAuth } from "../../Api/AuthContext";
import Message from "./Message";
import ConfigSkeleton from "./ConfigSkeleton";
import {
  Groups,
  Key,
  PeopleAlt,
  Settings,
  ArrowBack,
} from "@mui/icons-material";

function ClubStore() {
  const [step, setStep] = useState(1); // Étape 1 : Infos, Étape 2 : Clé d'activation
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const { switchPortal, updateAuth, setAuthData } = UseAuth();
  const [disciplines, setDisciplines] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectDiscipline, setSelectDiscipline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    discipline_id: "",
    logo: "",
    country_id: "",
    city: "",
    address: "",
    activation_key: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [disciplinesResponse, countriesResponse] = await Promise.all([
        Instance.get("/api/disciplines"),
        Instance.get("/api/countries"),
      ]);
      setDisciplines(disciplinesResponse.data || []);
      setCountries(countriesResponse.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Étape 1 validée -> Passage à l'étape de la clé
  const handleNextStep = (e) => {
    e.preventDefault();
    setError({});
    setStep(2);
  };

  // Soumission finale à la base de données
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);

    const formDataInitial = new FormData();
    formDataInitial.append("name", formData.name);
    formDataInitial.append("logo", formData.logo);
    formDataInitial.append("city", formData.city);
    formDataInitial.append("address", formData.address);
    formDataInitial.append("country_id", formData.country_id);
    formDataInitial.append("discipline_id", formData.discipline_id);
    formDataInitial.append("activation_key", formData.activation_key);

    try {
      const response = await Instance.post(
        "/api/clubs/clubs",
        formDataInitial,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response?.data?.success) {
        const { user, clubs, new_club, leagues } = response.data;

        const extractedRoles = user.clubs[0].roles.map((r) => r.name);

        updateAuth({
          user: user,
          clubs: clubs,
          role: extractedRoles,
        });
        localStorage.setItem("activeId", new_club.id);
        localStorage.setItem("activeType", "Club");
        localStorage.setItem("activeRole", new_club.role?.[0] || "admin");
        switchPortal(new_club.id, new_club.type, new_club.role);

        setSelectDiscipline(null);
        setFormData({
          name: "",
          discipline_id: "",
          logo: "",
          country_id: "",
          city: "",
          address: "",
          activation_key: "",
        });
        setSuccess(
          "Votre club a été créé avec succès. Rendez-vous dans le dashboard pour y accéder.",
        );
        setError({});
        setStep(1);
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
          p: 5,
          backgroundColor: "background.default",
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ fontWeight: "bold", fontSize: { xs: 18, md: 24 }, mb: 3 }}
        >
          Création de club
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        {step === 1 ? (
          /* ── ÉTAPE 1 : FORMULAIRE CLASSIQUE ── */
          <form onSubmit={handleNextStep}>
            {/* ── SECTION 1 ── */}
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              🏫 Informations du club
            </Typography>
            <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
              <TextField
                error={hasError("name")}
                helperText={getError("name")}
                name="name"
                label="Nom du club"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                required
              />

              <FormControl fullWidth error={hasError("discipline_id")} required>
                <InputLabel>Discipline</InputLabel>
                <Select
                  label="Discipline"
                  value={formData.discipline_id}
                  onChange={(e) =>
                    setFormData({ ...formData, discipline_id: e.target.value })
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: "background.default" },
                    },
                  }}
                >
                  {disciplines.length > 0 ? (
                    disciplines.map((disp) => (
                      <MenuItem key={disp.id} value={disp.id}>
                        {disp.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Aucune discipline</MenuItem>
                  )}
                </Select>
                {hasError("discipline_id") && (
                  <FormHelperText>{getError("discipline_id")}</FormHelperText>
                )}
              </FormControl>
            </Box>

            {/* ── SECTION 2 ── */}
            <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              🌍 Localisation
            </Typography>
            <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
              <FormControl fullWidth error={hasError("country_id")} required>
                <InputLabel>Pays</InputLabel>
                <Select
                  value={formData.country_id}
                  onChange={(e) =>
                    setFormData({ ...formData, country_id: e.target.value })
                  }
                  label="Pays"
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: "background.default" },
                    },
                  }}
                >
                  {countries.length > 0 ? (
                    countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Aucun pays</MenuItem>
                  )}
                </Select>
                {hasError("country_id") && (
                  <FormHelperText>{getError("country_id")}</FormHelperText>
                )}
              </FormControl>

              <TextField
                error={hasError("city")}
                helperText={getError("city")}
                name="city"
                label="La ville"
                fullWidth
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Box>

            <TextField
              error={hasError("address")}
              helperText={getError("address")}
              name="address"
              label="Adresse"
              fullWidth
              margin="normal"
              value={formData.address}
              onChange={handleChange}
            />

            {/* ── SECTION 3 ── */}
            <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              🖼️ Branding
            </Typography>
            <TextField
              error={hasError("logo")}
              helperText={getError("logo")}
              name="logo"
              type="file"
              fullWidth
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ p: 2, textTransform: "none", mt: 4 }}
            >
              Continuer vers l'activation
            </Button>
          </form>
        ) : (
          /* ── ÉTAPE 2 : CLÉ D'ACTIVATION SÉCURISÉE ── */
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
          >
            <Box
              sx={{
                p: 3,
                backgroundColor: "action.hover",
                borderRadius: 2,
                borderLeft: "5px solid",
                borderColor: "primary.main",
                display: "flex",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              <Key color="primary" sx={{ fontSize: 30, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Clé d'activation requise
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Pour finaliser la création de <strong>{formData.name}</strong>{" "}
                  à l'international, veuillez renseigner la clé d'activation
                  officielle fournie par l'administrateur du SaaS. Cette clé
                  valide votre licence d'utilisation.
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                error={hasError("activation_key")}
                helperText={getError("activation_key")}
                name="activation_key"
                label="Code de la clé d'activation"
                placeholder="Ex: CLUB-2026-XXXX-XXXX"
                fullWidth
                value={formData.activation_key}
                onChange={handleChange}
                required
                autoFocus
              />

              <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  sx={{ textTransform: "none", p: 1.5 }}
                >
                  Retour
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  sx={{ textTransform: "none", p: 1.5 }}
                >
                  {submitting
                    ? "Vérification de la clé..."
                    : "Activer et créer le club"}
                </Button>
              </Box>
            </form>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default ClubStore;
