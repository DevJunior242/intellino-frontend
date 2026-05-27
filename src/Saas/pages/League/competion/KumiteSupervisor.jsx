import { useCallback, useEffect, useRef, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import echo from "../../../../echo";
import TableauSuiviJuges from "./TableauSuiviJuges";
import ChronoCombat from "./ChronoCombat";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function KumiteSupervisor({
  config,
  onAthleteSuivant,
  initSeance,
}) {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [combat, setCombat] = useState(null);
  const [nextCombat, setNextCombat] = useState(null);
  const isInitialLoadRef = useRef(true);

  const getCombatEnCours = useCallback(async () => {
    if (!config?.id) return;
    try {
      if (isInitialLoadRef.current) setLoading(true);
      const [combatRes, nextRes] = await Promise.all([
        Instance.get(`/api/configs/${config.id}/combat-en-cours`),
        Instance.get(`/api/configs/${config.id}/next-combat`),
      ]);
      setCombat(combatRes.data?.combat || null);
      setNextCombat(nextRes.data?.combat || null);
      console.log("Combat en cours :", combatRes.data);
      console.log("Prochain combat :", nextRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [config]);

  useEffect(() => {
    if (!config) return;
    getCombatEnCours();
  }, [config.id, getCombatEnCours]);

  useEffect(() => {
    if (!config) return;
    const channel = echo.channel(`tatami.${config.id}`);
    channel.listen(".tatami.updated", () => getCombatEnCours());
    return () => echo.leaveChannel(`tatami.${config.id}`);
  }, [getCombatEnCours, config]);

  const lancerKumite = async () => {
    setSubmitting(true);
    setError({});
    setSuccess("");
    try {
      const res = await Instance.post(
        `/api/configs/${config.id}/lancer-kumite`,
      );
      if (res.data?.message) setSuccess(res.data.message || "seance lancée");
      initSeance();
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "Erreur lors du lancement du kumite";
      setError({ [config.id]: message });
    } finally {
      setSubmitting(false);
    }
  };
  const handleSuivant = async () => {
    setSubmitting(true);
    try {
      const { data } = await Instance.post(
        `/api/configs/${config.id}/combat-suivant`,
      );
      initSeance();
      onAthleteSuivant(data.combat);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isInitialLoadRef && loading) {
    return (
      <Box>
        <Skeleton
          variant="rectangular"
          height={100}
          sx={{ mb: 2, borderRadius: 3 }}
        />
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
        {/* Combat en cours */}
        {combat ? (
          <motion.div
            key="combat"
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
              }}
            >
              {/* AKA vs AO */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                {/* AKA — Rouge */}
                <Box sx={{ textAlign: "center", flex: 1 }}>
                  <Chip
                    label="AKA"
                    size="small"
                    sx={{
                      bgcolor: "#ef444420",
                      color: "#ef4444",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {combat?.inscription_aka?.athlete?.fullname ?? "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {combat?.inscription_aka?.competition?.category?.nom ?? "—"}
                  </Typography>
                </Box>

                {/* VS */}
                <ChronoCombat combat={combat} canControl={true} />

                {/* AO — Bleu */}
                <Box sx={{ textAlign: "center", flex: 1 }}>
                  <Chip
                    label="AO"
                    size="small"
                    sx={{
                      bgcolor: "#3b82f620",
                      color: "#3b82f6",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {combat?.inscription_ao?.athlete?.fullname ?? "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {combat?.inscription_ao?.competition?.category?.nom ?? "—"}
                  </Typography>
                </Box>
              </Stack>

              {/* Scores */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                mt={2}
                gap={3}
              >
                <Typography
                  variant="h4"
                  fontWeight="black"
                  sx={{ color: "#ef4444" }}
                >
                  {combat?.score_final_aka ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  score
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="black"
                  sx={{ color: "#3b82f6" }}
                >
                  {combat?.score_final_ao ?? 0}
                </Typography>
              </Stack>
            </Paper>
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              key="noCombat"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Aucun combat en cours. Lancez la séance pour commencer.
              </Alert>
            </motion.div>
          )
        )}

        {/* Prochain combat */}
        {nextCombat && (
          <motion.div
            key="next"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Prochain combat
              </Typography>
              <Stack direction="row" justifyContent="space-between" mt={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  {nextCombat?.inscription_aka?.athlete?.fullname ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  vs
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {nextCombat?.inscription_ao?.athlete?.fullname ?? "—"}
                </Typography>
              </Stack>
            </Paper>
          </motion.div>
        )}
        <TableauSuiviJuges configNotationId={config.id} />

        {/* Erreurs / succès */}
        <AnimatePresence>
          {success[config.id] && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success[config.id]}
            </Alert>
          )}
          {error[config.id] && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error[config.id]}
            </Alert>
          )}
        </AnimatePresence>

        {/* Bouton principal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideUp}
          transition={{ delay: 0.2 }}
        >
          <Button
            fullWidth
            variant="contained"
            disabled={submitting}
            onClick={() => {
              if (!combat) {
                lancerKumite();
              } else {
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
            }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : !combat ? (
              "Lancer la séance"
            ) : (
              "Combat suivant →"
            )}
          </Button>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
