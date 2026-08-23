import { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Stack,
  Avatar,
  IconButton,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import LanguageIcon from "@mui/icons-material/Language";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";

// Étapes du formulaire — utilisées pour la barre de progression
const STEPS = [
  { id: 1, label: "Informations" },
  { id: 2, label: "Activation & Mandat" },
];

const MAX_LOGO_SIZE_MB = 2;

export default function CreateFederationForm() {
  const { updateAuth, switchPortal } = UseAuth();
  const fileInputRef = useRef(null);
  const [countries, setCountries] = useState([]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    country_id: "",
    address: "",
    website: "",
    activation_key: "",
    mandate_end_at: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await Instance.get("/api/countries");
      setCountries(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Gestion des changements d'inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Sélection du logo + validation + aperçu
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        logo: "Le fichier doit être une image (PNG, JPG, SVG...).",
      }));
      return;
    }

    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: `L'image ne doit pas dépasser ${MAX_LOGO_SIZE_MB} Mo.`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, logo: "" }));
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Validation locale de l'étape 1
  const nextStep = (e) => {
    e.preventDefault();
    const step1Errors = {};
    if (!formData.name.trim()) step1Errors.name = "Le nom est obligatoire.";
    if (!formData.code.trim())
      step1Errors.code = "Le code de la fédération est obligatoire.";
    if (!formData.country_id)
      step1Errors.country_id = "Veuillez sélectionner un pays.";

    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
    } else {
      setErrors({});
      setStep(2);
    }
  };

  // Soumission finale au backend Laravel
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      // FormData multipart pour pouvoir joindre le fichier logo
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value ?? "");
      });
      if (logoFile) {
        payload.append("logo", logoFile);
      }

      const response = await Instance.post("/api/federations", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.success) {
        const { user, clubs, leagues, federations, new_federation } =
          response.data;

        // 1. Mise à jour instantanée du state global (incluant la nouvelle fédération)
        updateAuth({
          user,
          clubs,
          leagues,
          federations,
        });

        // 2. Redirection instantanée vers le portail de la fédération
        switchPortal(new_federation.id, "Federation", new_federation.role);

        setSuccess(
          "Fédération nationale configurée avec succès ! Redirection...",
        );

        // Reset du formulaire
        setFormData({
          name: "",
          code: "",
          country_id: "",
          address: "",
          website: "",
          activation_key: "",
          mandate_end_at: "",
        });
        handleRemoveLogo();
        setStep(1);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        setErrors({
          general: "Une erreur système est survenue. Veuillez réessayer.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
    }),
  };

  const stepVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <Box sx={{ maxWidth: 520, mx: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.default",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          align="center"
          fontWeight={700}
          color="text.primary"
          gutterBottom
        >
          Créer une Fédération Nationale
        </Typography>

        {/* Barre de progression */}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 3, mb: 4 }}
        >
          {STEPS.map((s) => (
            <Stack key={s.id} direction="row" alignItems="center" spacing={1}>
              <Box
                component={motion.div}
                animate={{
                  backgroundColor: step === s.id ? "#1976d2" : "#e0e0e0",
                  color: step === s.id ? "#fff" : "#9e9e9e",
                }}
                transition={{ duration: 0.3 }}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {s.id}
              </Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color={step === s.id ? "primary.main" : "text.disabled"}
              >
                {s.label}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            </motion.div>
          )}
          {errors.general && (
            <motion.div
              key="general-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.general}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Box component="form" onSubmit={step === 1 ? nextStep : handleSubmit}>
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <Stack spacing={2.5}>
                  {/* Logo de la fédération */}
                  <motion.div
                    custom={0}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Stack alignItems="center" spacing={1}>
                      <Box sx={{ position: "relative" }}>
                        <Avatar
                          src={logoPreview || undefined}
                          variant="rounded"
                          sx={{
                            width: 96,
                            height: 96,
                            border: "2px dashed",
                            borderColor: errors.logo
                              ? "error.main"
                              : "grey.300",
                          }}
                        >
                          {!logoPreview && <PhotoCameraIcon color="disabled" />}
                        </Avatar>
                        {logoPreview && (
                          <IconButton
                            size="small"
                            onClick={handleRemoveLogo}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              bgcolor: "background.default",
                              boxShadow: 1,
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        )}
                      </Box>
                      <Button
                        size="small"
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                      >
                        {logoPreview ? "Changer le logo" : "Ajouter un logo"}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleLogoChange}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Facultatif — PNG ou JPG, {MAX_LOGO_SIZE_MB} Mo max.
                      </Typography>
                      {errors.logo && (
                        <Typography variant="caption" color="error">
                          {errors.logo}
                        </Typography>
                      )}
                    </Stack>
                  </motion.div>

                  <motion.div
                    custom={1}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <TextField
                      fullWidth
                      label="Nom complet de la Fédération"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Fédération Burkinabè de Karaté"
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </motion.div>

                  <motion.div
                    custom={2}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <TextField
                      fullWidth
                      label="Code / Sigle"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ex: FBK"
                      error={!!errors.code}
                      helperText={errors.code}
                    />
                  </motion.div>

                  <motion.div
                    custom={3}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* <TextField
                      select
                      fullWidth
                      label="Pays"
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleChange}
                      error={!!errors.country_id}
                      helperText={errors.country_id}
                    >
                      <MenuItem value="">
                        <em>Sélectionnez un pays</em>
                      </MenuItem>
                      <MenuItem>
                        {countries.length > 0 ? (
                          countries.map((country) => (
                            <MenuItem key={country.id} value={country.id}>
                              {country.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>Aucun pays</MenuItem>
                        )}
                      </MenuItem>
                    </TextField> */}
                    <FormControl
                      fullWidth
                      error={!!errors.country_id}
                      helperText={errors.country_id}
                    >
                      <InputLabel>Pays</InputLabel>
                      <Select
                        value={formData.country_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            country_id: e.target.value,
                          })
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
                      {/* {errors.country_id && (
                        <FormHelperText>{errors.country_id[0]}</FormHelperText>
                      )} */}
                    </FormControl>
                  </motion.div>

                  <motion.div
                    custom={4}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <TextField
                      fullWidth
                      label="Adresse (Siège social)"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </motion.div>

                  <motion.div
                    custom={5}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <TextField
                      fullWidth
                      type="url"
                      label="Site Web officiel"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LanguageIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </motion.div>

                  <motion.div
                    custom={6}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Button
                      type="submit"
                      fullWidth
                      size="large"
                      variant="contained"
                      component={motion.button}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continuer vers l'étape suivante
                    </Button>
                  </motion.div>
                </Stack>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={-1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <Stack spacing={2.5}>
                  <Alert severity="info" variant="outlined">
                    Optionnel : si vous avez déjà reçu une clé d'activation
                    fédérale, renseignez-la ci-dessous. Sinon, laissez ce
                    champ vide — la fédération sera créée quand même et
                    démarrera une période d'essai. Vous serez prévenu du
                    nombre de jours restants depuis le tableau de bord ; si
                    aucune clé n'est renseignée avant la fin de l'essai, la
                    fédération sera désactivée (plus aucune action possible)
                    jusqu'à ce qu'une clé valide soit fournie. Contactez le
                    support pour obtenir la vôtre.
                  </Alert>

                  <TextField
                    fullWidth
                    label="Clé d'activation fédérale (optionnelle)"
                    name="activation_key"
                    value={formData.activation_key}
                    onChange={handleChange}
                    placeholder="FED-XXXX-XXXX-XXXX"
                    error={!!errors.activation_key}
                    helperText={
                      errors.activation_key?.[0] || errors.activation_key
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      sx: {
                        fontFamily: "monospace",
                        letterSpacing: 2,
                        textAlign: "center",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Date de fin de ton mandat d'administration"
                    name="mandate_end_at"
                    value={formData.mandate_end_at}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.mandate_end_at}
                    helperText={
                      errors.mandate_end_at?.[0] ||
                      "Laisse vide si la durée du mandat est indéterminée."
                    }
                  />

                  <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      variant="outlined"
                      color="inherit"
                      startIcon={<ArrowBackIcon />}
                      sx={{ flex: 1 }}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      variant="contained"
                      color="success"
                      sx={{ flex: 2 }}
                      component={motion.button}
                      whileHover={{ scale: loading ? 1 : 1.01 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : formData.activation_key?.trim() ? (
                        "Activer la Fédération"
                      ) : (
                        "Créer la Fédération (période d'essai)"
                      )}
                    </Button>
                  </Stack>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>
    </Box>
  );
}
