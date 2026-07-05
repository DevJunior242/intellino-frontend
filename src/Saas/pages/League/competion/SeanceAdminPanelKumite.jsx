import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Stack,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import { Instance } from "../../../../Api/Axios";
import ArbitresKumitePanel from "./ArbitresKumitePanel";
import { useCallback, useEffect, useRef, useState } from "react";
import echo from "../../../../echo";
import CombatEnCours from "./CombatEnCours";
import ProchainCombat from "./ProchainCombat";
import LoadingKumite from "./LoadingKumite";
import VainqueurOverlay from "./VainqueurOverlay";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SeanceAdminPanelKumite = ({
  config,
  data,
  handleValider,
  handleDesignerSuperviseur,
  handleRetirerSuperviseur,
  onRefresh,
  onValidated,
  success,
  errors,
  submitId,
}) => {
  const isValidee = config?.est_valide;

  const { arbitres } = data;
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [combat, setCombat] = useState(null);
  const [nextCombat, setNextCombat] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoadRef = useRef(true);
  const fetchData = useCallback(
    async (showLoading = false) => {
      if (!config?.id) return;
      if (showLoading) setLoading(true);
      try {
        if (isInitialLoadRef.current) setLoading(true);
        const [combatRes, nextRes] = await Promise.all([
          Instance.get(`/api/public/configs/${config?.id}/combat-en-cours`),
          Instance.get(`/api/public/configs/${config?.id}/next-combat`),
        ]);
        setCombat(combatRes.data?.combat || null);
        setNextCombat(nextRes.data?.combat || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    },
    [config?.id],
  );

  useEffect(() => {
    fetchData(true);
  }, [config?.id, fetchData]);

  const handleLocalValider = async (id) => {
    if (!id) return;
    setLocalSubmitting(true);
    try {
      await Instance.post(`/api/seances/configs/${id}/valider`);
      // clear any previous local errors
      setLocalError(null);
      onValidated?.();
      onRefresh?.();
    } catch (err) {
      const data = err.response?.data;
      if (data?.error === "missing_kumite_format") {
        setAvailableFormats(data.formats || []);
        setFormatModalOpen(true);
      } else {
        const msg =
          data?.problemes || data?.message || "Une erreur est survenue.";
        setLocalError(msg);
      }
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleConfirmFormat = async () => {
    if (!selectedFormat || !config?.id) return;
    setLocalSubmitting(true);
    try {
      await Instance.post(`/api/seances/configs/${config.id}/valider`, {
        kumite_format_id: selectedFormat,
      });
      setFormatModalOpen(false);
      setSelectedFormat(null);
      setLocalError(null);
      onValidated?.();
      onRefresh?.();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.problemes || data?.message || "Erreur lors de la validation";
      setLocalError(msg);
    } finally {
      setLocalSubmitting(false);
    }
  };

  useEffect(() => {
    if (!config?.id) return;
    const channel = echo.channel(`tatami.${config?.id}`);
    const handler = () => fetchData();
    channel.listen(".tatami.updated", handler);
    return () => channel.stopListening(".tatami.updated", handler);
  }, [config?.id, fetchData]);

  // Listen for global event when validation is triggered from parent
  useEffect(() => {
    const onMissing = (e) => {
      const { formats, configId } = e.detail || {};
      if (configId === config?.id) {
        setAvailableFormats(formats || []);
        setFormatModalOpen(true);
      }
    };
    window.addEventListener("missingKumiteFormat", onMissing);
    return () => window.removeEventListener("missingKumiteFormat", onMissing);
  }, [config?.id]);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#1e2433", borderRadius: 2 },
      }}
    >
      {loading && <LoadingKumite />}
      {/* Messages */}
      {success[config.id] && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success[config.id]}
          </Alert>
        </Fade>
      )}
      {errors[config.id]?.length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {Array.isArray(errors[config.id]) ? (
            errors[config.id].map((err, i) => (
              <p key={i} style={{ margin: 0 }}>
                {err}
              </p>
            ))
          ) : (
            <p style={{ margin: 0 }}>{errors[config.id]}</p>
          )}
        </Alert>
      )}
      {localError && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setLocalError(null)}
        >
          {Array.isArray(localError) ? (
            localError.map((err, i) => (
              <p key={i} style={{ margin: 0 }}>
                {err}
              </p>
            ))
          ) : (
            <p style={{ margin: 0 }}>{localError}</p>
          )}
        </Alert>
      )}

      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        gap={1.5}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="white"
            sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
          >
            {config.evenement_nom}
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b90a0" }}>
            {config.plateau_nom}
          </Typography>
        </Box>
        {!isValidee && (
          <Button
            variant="contained"
            color="primary"
            disabled={submitId === config.id || localSubmitting}
            onClick={() => handleLocalValider(config?.id)}
            sx={{ borderRadius: 3, fontWeight: "bold", flexShrink: 0 }}
          >
            {submitId === config.id || localSubmitting ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={16} color="inherit" />
                <span>Validation...</span>
              </Stack>
            ) : (
              "Valider la configuration"
            )}
          </Button>
        )}
      </Stack>

      {combat ? (
        <CombatEnCours combat={combat} canControl={false} />
      ) : (
        !loading && (
          <motion.div
            key="noCombat"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Aucun combat en cours.
            </Alert>
          </motion.div>
        )
      )}
      <VainqueurOverlay combat={combat} onClose={fetchData} />

      {/* Prochain combat */}
      <ProchainCombat nextCombat={nextCombat} />

      {/* Panel arbitres */}

      <ArbitresKumitePanel
        config={config}
        arbitres={arbitres}
        handleDesignerSuperviseur={handleDesignerSuperviseur}
        handleRetirerSuperviseur={handleRetirerSuperviseur}
        onRefresh={onRefresh}
      />

      <Dialog open={formatModalOpen} onClose={() => setFormatModalOpen(false)}>
        <DialogTitle>Choisir le format kumite</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
          >
            {availableFormats.map((f) => (
              <FormControlLabel
                key={f.id}
                value={f.id}
                control={<Radio />}
                label={f.code}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormatModalOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            disabled={!selectedFormat || localSubmitting}
            onClick={handleConfirmFormat}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeanceAdminPanelKumite;
