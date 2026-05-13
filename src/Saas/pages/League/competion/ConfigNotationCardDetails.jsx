import React, { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../../../Api/AuthContext";
import { Instance } from "../../../../Api/Axios";
import {
  EmojiEvents,
  LockOutlinedIcon,
  LoginIcon,
  ArrowBackIcon,
  ErrorOutlineOutlinedIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import ConfigNotationCard from "./ConfigNotationCard";
import SeanceAdminPanel from "./SeanceAdminPanel";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import SaisieNotePage from "./SaisieNotePage";
import JugePrincipalDashboard from "./JugePrincipalDashboard";
import DesignerSuperviseur from "./DesignerSuperviseur";
import RepartitionAthletes from "./RepartitionAthletes";

export default function ConfigNotationCardDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState({});
  const [configs, setConfigs] = useState([]);
  const [submitId, setSubmitId] = useState(null);
  const { auth, activeId, activeType, activeRole } = UseAuth();

  const adminJuge = activeRole?.includes("admin_league");

  const estArbitre = auth?.role?.includes("arbitre_league");

  // UN seul système de vue
  const [vue, setVue] = useState("config");
  const [configActive, setConfigActive] = useState(null);
  const [enCours, setEnCours] = useState(null);

  // Arbitre69-
  const [poste, setPoste] = useState(null);
  const [pin, setPin] = useState("");
  const [erreurPin, setErreurPin] = useState({});

  const [loadingPin, setLoadingPin] = useState(false);

  // ── Fetch configs ──────────────────────────────────
  const getConfigs = useCallback(async () => {
    setLoading(true);
    if (!activeId) return;
    try {
      const res = await Instance.get(
        `/api/config-notation/config-notation?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log("getConfigs res", res);
      setConfigs(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId, activeType]);

  useEffect(() => {
    getConfigs();
  }, [getConfigs]);

  // ── Admin — Valider ────────────────────────────────
  const handleValider = async (id) => {
    setSubmitId(id);
    setSuccess((prev) => ({ ...prev, [id]: null }));
    setError((prev) => ({ ...prev, [id]: [] }));
    try {
      await Instance.post(`/api/seances/configs/${id}/valider`);
      const freshConfigs = await getConfigs();

      const config = freshConfigs?.find((c) => c.id === id);
      if (config) setConfigActive(config);

      setVue("repartition");
    } catch (err) {
      console.error(" erreur valider ", err);
      const msg = err.response?.data?.problemes ||
        err.response?.data?.message || ["Une erreur est survenue."];
      setError((prev) => ({ ...prev, [id]: msg }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, [id]: [] }));
      }, 5000);
    } finally {
      setSubmitId(null);
    }
  };

  // ── Admin — Lancer séance ──────────────────────────
  const handleLaunchSeance = async (configId) => {
    setSuccess((prev) => ({ ...prev, [configId]: null }));
    setError((prev) => ({ ...prev, [configId]: [] }));
    try {
      const res = await Instance.post(
        `/api/seances/configs/${configId}/lancer`,
      );
      if (res.data.success) {
        const config = configs.find((c) => c.id === configId);

        setConfigActive(config);
        setEnCours(res.data.enCours);
        setVue("seance");
      }
    } catch (err) {
      const msg = err.response?.data?.problemes || ["Une erreur est survenue."];
      setError((prev) => ({ ...prev, [configId]: msg }));
    }
  };
  //  Initialiser la seance
  const initSeance = useCallback(async () => {
    const configId = localStorage.getItem("config_active_id");
    const savedPoste = localStorage.getItem("poste");

    if (!configId) return;

    try {
      const config = configs.find((c) => c.id === configId);
      if (!config) return;

      const { data } = await Instance.get(
        `/api/seances/competition/${config.id}/en-cours`,
      );

      setConfigActive(config);

      if (data.enCours) {
        // il y a encore un athlète en cours
        setEnCours(data.enCours);
      }

      if (savedPoste) {
        setPoste(savedPoste);
        //setVue("saisie"); // arbitre direct
      } else {
        setVue("seance"); // admin
      }
    } catch (err) {
      console.error(err);
    }
  }, [configs]);

  useEffect(() => {
    getConfigs();
  }, [getConfigs]);

  useEffect(() => {
    if (configs.length > 0) {
      initSeance();
    }
  }, [configs, initSeance]);
  // ── Arbitre — Ouvrir saisie PIN ────────────────────
  const ouvrirPin = (config) => {
    setConfigActive(config);
    setPin("");
    setErreurPin({});
    setVue("pin");
  };

  // ── Arbitre — Soumettre PIN ────────────────────────
  const soumettrePin = async () => {
    setLoadingPin(true);
    setErreurPin({});
    try {
      const res = await Instance.post(
        `/api/seances/configs/${configActive.id}/connecter-tablette`,
        { code_acces: pin },
      );
      console.log("res", res);
      if (res.data.success) {
        localStorage.setItem("poste", res.data.poste);
        //localStorage.setItem("config_active_id", configActive.id);
        setPoste(res.data.poste);
        //superviseur dans configNotationCard, arbitre
        if (res.data.superviseur === 1) {
          setVue("seance");
        } else {
          setVue("saisie");
        }
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setLoadingPin(false);
    }
  };

  // ── Rendu ──────────────────────────────────────────
  // Vue saisie notes arbitre
  if (vue === "saisie") {
    return (
      <SaisieNotePage
        config={configActive}
        competitionId={configActive.competition_id}
        poste={poste}
      />
    );
  }

  // Vue PIN arbitre
  if (vue === "pin") {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          bgcolor: "background.default",
          // Effet de fond subtil pour une ambiance professionnelle
          backgroundImage:
            "radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), transparent 40%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              width: "100%",
              maxWidth: 400,
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Logo ou icône pour identifier la plateforme */}
            <Box sx={{ mb: 2 }}>
              <EmojiEvents
                sx={{
                  fontSize: 48,
                  color: "primary.main",
                  mb: 1,
                }}
              />
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {configActive.plateau_nom}
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              Veuillez entrer votre code d'accès à 6 chiffres
            </Typography>

            {/* Affichage des erreurs avec animation */}
            <AnimatePresence>
              {error.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: "error.50",
                      border: "1px solid",
                      borderColor: "error.light",
                    }}
                    icon={<ErrorOutlineOutlinedIcon />}
                  >
                    <Typography variant="body2">{error.general}</Typography>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Champ PIN avec style amélioré */}
            <Box sx={{ position: "relative", mb: 2 }}>
              <TextField
                fullWidth
                label="Code PIN"
                name="code_acces"
                value={pin}
                onChange={(e) => {
                  // Limiter à 6 chiffres
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPin(value);
                }}
                inputProps={{
                  maxLength: 6,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  style: {
                    fontSize: "2rem",
                    textAlign: "center",
                    letterSpacing: "0.5rem",
                    fontFamily: "monospace",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  },
                }}
                autoFocus
                autoComplete="one-time-code"
                required
                error={!!error?.code_acces}
              />
              {/* Indicateur de longueur */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 1,
                  gap: 1,
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: index < pin.length ? "primary.main" : "divider",
                      transition: "background-color 0.3s",
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Erreur spécifique au code PIN */}
            <AnimatePresence>
              {error?.code_acces && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: "error.50",
                      border: "1px solid",
                      borderColor: "error.light",
                    }}
                    icon={<ErrorOutlineOutlinedIcon />}
                  >
                    <Typography variant="body2">{error.code_acces}</Typography>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton de connexion avec feedback visuel */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={pin.length !== 6 || loadingPin}
              onClick={soumettrePin}
              sx={{
                py: 2,
                borderRadius: 3,
                mt: 1,
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                },
              }}
              startIcon={loadingPin ? null : <LoginIcon />}
            >
              {loadingPin ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Se connecter"
              )}
            </Button>

            {/* Bouton Retour avec style discret */}
            <Button
              fullWidth
              sx={{
                mt: 2,
                color: "text.secondary",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "action.hover",
                  color: "text.primary",
                },
              }}
              onClick={() => setVue("config")}
              startIcon={<ArrowBackIcon />}
            >
              Retour
            </Button>

            {/* Aide contextuelle */}
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mt: 3, display: "block" }}
            >
              Besoin d'aide ? Contactez l'administrateur de la compétition.
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }
  if (vue === "repartition" && configActive) {
    return (
      <RepartitionAthletes
        competition={configActive.competition_id}
        configs={configs.filter(
          (c) => c.competition_id === configActive.competition_id,
        )}
      />
    );
  }
  if (adminJuge) {
    return (
      <JugePrincipalDashboard
        configs={configs}
        loading={loading}
        handleValider={handleValider}
        onConnecterJuge={ouvrirPin}
        estArbitre={estArbitre}
        errors={error}
        success={success}
        submitId={submitId}
      />
    );
  }

  // Vue séance admin
  if (vue === "seance") {
    return (
      <SeanceAdminPanel
        error={error}
        success={success}
        initSeance={initSeance}
        config={configActive}
        loading={loading}
        handleLaunchSeance={handleLaunchSeance}
        onAthleteSuivant={(suivant) => {
          console.log("NEW ATHLETE", suivant);
          setEnCours(suivant);
        }}
      />
    );
  }

  // Vue config (défaut)
  return (
    <Box>
      <ConfigNotationCard
        configs={configs}
        loading={loading}
        handleValider={handleValider}
        handleLaunchSeance={handleLaunchSeance}
        onConnecterJuge={ouvrirPin}
        estArbitre={estArbitre}
        errors={error}
        success={success}
        submitId={submitId}
      />
    </Box>
  );
}
