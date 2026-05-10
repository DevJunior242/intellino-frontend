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
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import PulseLoader from "react-spinners/PulseLoader";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";

function Storeleague() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { switchPortal, updateAuth } = UseAuth();
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCountry, setErrorCountry] = useState("");

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

  const [formData, setFormData] = useState({
    name: "",
    country_id: "",
    region: "",
    address: "",
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
    formDataInitial.append("region", formData.region);
    formDataInitial.append("address", formData.address);
    formDataInitial.append("country_id", formData.country_id);
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
        const { user, leagues, new_league } = response.data;

        // 1. Extraire les noms des rôles pour le State (Format: ["admin_club"])
        // On cherche les rôles dans le premier club car c'est celui qu'on vient de créer
        const extractedRoles = user.leagues[0].roles.map((r) => r.name);

        // 2. Mettre à jour l'authentification globale
        // On passe les rôles extraits pour écraser l'ancien tableau vide
        updateAuth({
          user: user,
          leagues: leagues,
          role: extractedRoles,
        });

        // 3. Forcer le rôle actif sur le nouveau club
        switchPortal(new_league.id, new_league.type, new_league.role); //reset form
        setFormData({
          name: "",
          phone: "",

          logo: "",
        });
        setSuccess(response.data.message);

        setError({});
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

        <form onSubmit={handleSubmit}>
          {/* ── SECTION 1 ── */}
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            🏫 Informations Ligue
          </Typography>
          <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
            {/* Nom du club — demi-largeur */}
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
            {/* Pays — demi-largeur */}
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

            {/* Région — demi-largeur (à côté du pays) */}
            <TextField
              error={hasError("region")}
              helperText={getError("region")}
              name="region"
              label="Région(ex: centre)"
              fullWidth
              value={formData.region}
              onChange={handleChange}
              required
            />
          </Box>
          {/* Adresse — pleine largeur */}
          <TextField
            error={hasError("address")}
            helperText={getError("address")}
            name="address"
            label="Adresse(optionel)"
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

          {/* ── SUBMIT ── */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ p: 2, textTransform: "none", mt: 2 }}
            disabled={submitting}
          >
            {submitting ? "Chargement..." : "Créer la ligue"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Storeleague;
