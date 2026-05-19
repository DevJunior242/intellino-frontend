import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import PulseLoader from "react-spinners/PulseLoader";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";
import { Groups, Key, ArrowBack } from "@mui/icons-material";
function Storeleague() {
  const [step, setStep] = useState(1); // Étape 1 : Informations, Étape 2 : Clé d'activation
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);
  const { switchPortal, updateAuth } = UseAuth();
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCountry, setErrorCountry] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    country_id: "",
    region: "",
    address: "",
    logo: "",
    activation_key: "", // Ajout du champ pour recevoir la clé
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorCountry("");
    try {
      const res = await Instance.get("/api/countries");
      setCountries(res.data || []);
    } catch (error) {
      console.log(error);
      setErrorCountry(
        "Une erreur est survenue lors de la récupération des pays",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Validation locale de l'étape 1 et passage à la clé
  const handleNextStep = (e) => {
    e.preventDefault();
    setError({});
    setStep(2);
  };

  // Soumission finale vers ton backend Laravel (sécurisé par DB::transaction)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);

    const formDataInitial = new FormData();
    formDataInitial.append("name", formData.name);
    formDataInitial.append("region", formData.region);
    formDataInitial.append("address", formData.address);
    formDataInitial.append("country_id", formData.country_id);
    formDataInitial.append("logo", formData.logo);
    formDataInitial.append("activation_key", formData.activation_key); // On pousse la clé au serveur

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
        const { user, leagues, new_league } = response.data;

        const extractedRoles = user.leagues[0].roles.map((r) => r.name);

        updateAuth({
          user: user,
          leagues: leagues,
          role: extractedRoles,
        });

        switchPortal(new_league.id, new_league.type, new_league.role);

        setFormData({
          name: "",
          country_id: "",
          region: "",
          address: "",
          logo: "",
          activation_key: "",
        });
        setSuccess(response.data.message);
        setError({});
        setStep(1); // Reset au premier step au cas où
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

  if (loading) return <ConfigSkeleton />;
  if (errorCountry) return <ErrorBlock text={errorCountry} type="error" />;

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
          Espace Ligue
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        {step === 1 ? (
          /* ── ÉTAPE 1 : FORMULAIRE INFORMATIONS LIGUE ── */
          <form onSubmit={handleNextStep}>
            {/* ── SECTION 1 ── */}
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              🏫 Informations Ligue
            </Typography>
            <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
              <TextField
                error={hasError("name")}
                helperText={getError("name")}
                name="name"
                label="Nom de la Ligue"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                required
              />
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
                error={hasError("region")}
                helperText={getError("region")}
                name="region"
                label="Région (ex: centre)"
                fullWidth
                value={formData.region}
                onChange={handleChange}
                required
              />
            </Box>

            <TextField
              error={hasError("address")}
              helperText={getError("address")}
              name="address"
              label="Adresse (optionnel)"
              fullWidth
              margin="normal"
              value={formData.address}
              onChange={handleChange}
            />

            {/* ── SECTION 3 ── */}
            <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
              🖼️ Logo
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
          /* ── ÉTAPE 2 : SÉCURISATION ET CLÉ D'ACTIVATION ── */
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
                  Clé de licence Ligue requise
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Pour authentifier et ouvrir l'espace officiel de la{" "}
                  <strong>{formData.name}</strong>, veuillez renseigner la clé
                  d'activation sécurisée transmise par l'éditeur du SaaS. Cette
                  procédure protège les données fédérales de votre pays.
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                error={hasError("activation_key")}
                helperText={getError("activation_key")}
                name="activation_key"
                label="Code d'activation de la Ligue"
                placeholder="Ex: LIGUE-2026-XXXX-XXXX"
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
                    : "Activer et créer la ligue"}
                </Button>
              </Box>
            </form>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Storeleague;
