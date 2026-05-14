import { useCallback, useEffect, useRef, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Fade,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import NotesProgress from "./NotesProgress";
import ProchainAthlete from "./ProchainAthlete";
import echo from "../../../../echo";

// Animations pour les transitions fluides
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SeanceAdminPanel({
  config,
  onAthleteSuivant,
  initSeance,
  handleLaunchSeance,
  error,
  success,
}) {
  const [notes, setNotes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enCours, setEnCours] = useState(null);
  const [nextAthlete, setNextAthlete] = useState(null);
  const isInitialLoadRef = useRef(true);

  // Toutes les notes reçues pour l'athlète en cours
  const toutesNotees = notes?.length === config?.juges_option;

  // Récupération des données avec gestion intelligente du loading

  const getEnCours = useCallback(async () => {
    if (!config?.id) return;
    try {
      if (isInitialLoadRef.current) setLoading(true);
      const [enCoursRes, nextAthleteRes] = await Promise.all([
        Instance.get(`/api/seances/competition/${config.id}/en-cours`),
        Instance.get(`/api/configs/${config.id}/next-athlete`),
      ]);
      const enCoursData = enCoursRes.data?.enCours || enCoursRes.data || null;
      const nextAthleteData =
        nextAthleteRes.data?.prochain || nextAthleteRes.data || null;
      setEnCours(enCoursData);
      setNextAthlete(nextAthleteData);
      setNotes([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [config]); // ← isInitialLoad retiré des deps

  useEffect(() => {
    if (!config) return;
    getEnCours();
  }, [config.id, getEnCours]);

  // Channel WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    if (!config) return;
    const channel = echo.channel(`tatami.${config.id}`);
    channel.listen(".tatami.updated", () => {
      getEnCours();
    });
    return () => {
      echo.leaveChannel(`tatami.${config.id}`);
    };
  }, [getEnCours, config]);

  const handleSuivant = async () => {
    setSubmitting(true);
    try {
      const { data } = await Instance.post(
        `/api/seances/configs/${config.id}/athlete-suivant`,
      );
      initSeance();
      onAthleteSuivant(data.enCours);
    } catch (err) {
      console.error("Erreur lors du passage à l'athlète suivant:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Affichage du skeleton pendant le chargement initial
  if (isInitialLoadRef && loading) {
    return (
      <Box>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="circular" width={40} height={40} />
          </Stack>
        </Paper>

        <Skeleton
          variant="rectangular"
          height={60}
          sx={{ mb: 2, borderRadius: 2 }}
        />

        <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <AnimatePresence mode="wait">
        {/* Athlète en cours avec animation */}
        {enCours ? (
          <motion.div
            key="enCours"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Paper
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "primary.light",
                bgcolor: "primary.50",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {enCours?.inscription?.athlete?.fullname ?? "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Passage N°{enCours?.ordre ?? "—"} · Catégorie :{" "}
                    {enCours?.inscription?.competition?.category?.nom ?? "—"} (
                    {enCours?.inscription?.competition?.category?.sexe ?? "—"})
                  </Typography>
                </Box>
                <Chip
                  label={`${notes.length}/${config?.juges_option} notes`}
                  color={toutesNotees ? "success" : "warning"}
                  sx={{
                    fontWeight: "bold",
                    minWidth: "100px",
                    justifyContent: "center",
                  }}
                />
              </Stack>
            </Paper>
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              key="noEnCours"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Aucune séance en cours. Lancez une séance pour commencer.
              </Alert>
            </motion.div>
          )
        )}

        {/* Prochain athlète avec transition */}
        <motion.div
          key="nextAthlete"
          initial="hidden"
          animate="visible"
          variants={slideUp}
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={60}
              sx={{ mb: 2, borderRadius: 2 }}
            />
          ) : nextAthlete ? (
            <ProchainAthlete nextAthlete={nextAthlete} compact />
          ) : (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Aucun athlète en attente
            </Typography>
          )}
        </motion.div>

        {/* Erreurs / succès avec animations */}
        <AnimatePresence>
          {success[config.id] && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {success[config.id]}
              </Alert>
            </motion.div>
          )}
          {error[config.id]?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {Array.isArray(error[config.id]) ? (
                  error[config.id].map((err, index) => <p key={index}>{err}</p>)
                ) : (
                  <p>{error[config.id]}</p>
                )}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suivi des notes avec loading si nécessaire */}
        {enCours && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ delay: 0.1 }}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={50}
                sx={{ borderRadius: 2, mb: 2 }}
              />
            ) : (
              <NotesProgress
                ordrePassageId={enCours?.id ?? null}
                nbJuges={config.juges_option}
                onNotesChange={setNotes}
                configId={config.id}
              />
            )}
          </motion.div>
        )}

        {/* Bouton principal avec états clairs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideUp}
          transition={{ delay: 0.2 }}
        >
          <Button
            fullWidth
            variant="contained"
            disabled={submitting || (enCours && !toutesNotees)}
            onClick={() => {
              if (!enCours) {
                handleLaunchSeance(config?.id);
              } else if (enCours && toutesNotees) {
                handleSuivant();
              }
            }}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
              },
              "&.Mui-disabled": {
                backgroundColor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : !enCours ? (
              "Lancer la séance"
            ) : toutesNotees ? (
              "Athlète suivant →"
            ) : (
              `En attente des notes (${notes.length}/${config.juges_option})`
            )}
          </Button>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
