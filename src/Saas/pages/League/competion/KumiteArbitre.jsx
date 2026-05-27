import { useCallback, useEffect, useRef, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import {
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
import ChronoCombat from "./ChronoCombat";
import PenaliteDisplay from "./PenaliteDisplay";

const C = {
  aka: "#ef4444",
  akaLight: "#ef444420",
  ao: "#3b82f6",
  aoLight: "#3b82f620",
  penalty: "#f59e0b",
  penaltyLight: "#f59e0b20",
  bg: "#0f1623",
  card: "#141c2b",
  border: "#1e2a3a",
  text: "#e2e8f0",
  muted: "#64748b",
};

const ACTIONS = {
  points: [
    { type: "yuko", label: "Yuko", valeur: 1, desc: "Coup de poing" },
    {
      type: "waza_ari",
      label: "Waza-ari",
      valeur: 2,
      desc: "Coup de pied moyen",
    },
    { type: "ippon", label: "Ippon", valeur: 3, desc: "Coup de pied tête" },
  ],
  penalites: [
    { type: "chukoku", label: "Chukoku", valeur: 0, desc: "Avertissement" },
    { type: "keikoku", label: "Keikoku", valeur: 1, desc: "+1pt adversaire" },
    {
      type: "hansoku_chui",
      label: "Hansoku-chui",
      valeur: 2,
      desc: "+2pts adversaire",
    },
    { type: "hansoku", label: "Hansoku", valeur: 0, desc: "Disqualification" },
  ],
};

export default function KumiteArbitre({ config }) {
  const [combat, setCombat] = useState(null);
  const [nextCombat, setNextCombat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null); // type en cours d'envoi
  const [lastAction, setLastAction] = useState(null);
  const combatRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const fetchCombat = useCallback(async () => {
    if (!config.id) return;
    try {
      if (isInitialLoadRef.current) setLoading(true);
      const [combatRes, nextRes] = await Promise.all([
        Instance.get(`/api/configs/${config.id}/combat-en-cours`),
        Instance.get(`/api/configs/${config.id}/next-combat`),
      ]);
      const combatData = combatRes.data?.combat || null;

      // Reset si combat change
      if (combatData?.id !== combatRef.current?.id) {
        setLastAction(null);
      }
      combatRef.current = combatData;
      setCombat(combatData);
      setNextCombat(nextRes.data?.combat || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [config.id]);

  useEffect(() => {
    fetchCombat();
  }, [config.id, fetchCombat]);

  useEffect(() => {
    if (!config.id) return;
    const channel = echo.channel(`tatami.${config.id}`);
    channel.listen(".tatami.updated", () => fetchCombat());
    return () => echo.leaveChannel(`tatami.${config.id}`);
  }, [config.id, fetchCombat]);

  const envoyerAction = async (combattant, type, valeur) => {
    if (!combat?.id) return;
    const key = `${combattant}-${type}`;
    setSending(key);

    try {
      const jugeNumero = parseInt(localStorage.getItem("juge_numero")) || 1;

      const clientTimestamp = new Date().toISOString();
      console.log("clientTimestamp", clientTimestamp);

      const res = await Instance.post("/api/combat-actions", {
        combat_id: combat.id,
        juge_numero: jugeNumero,
        combattant, // 'aka' ou 'ao'
        type, // 'yuko', 'waza_ari', 'ippon', 'penalite'
        valeur,
        client_timestamp: clientTimestamp,
      });

      console.log("donnees", res);

      setLastAction({
        combattant,
        type,
        label: ACTIONS.points.find((a) => a.type === type)?.label || type,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(null);
    }
  };
  // 1. Récupérer ou créer un token unique propre à CET onglet au chargement du fichier
  let judgeToken = sessionStorage.getItem("tatami_judge_token");
  if (!judgeToken) {
    judgeToken =
      "judge-" +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);
    sessionStorage.setItem("tatami_judge_token", judgeToken);
  }

  // 2. Ta fonction d'initialisation adaptée
  const initialiserTablette = useCallback(async () => {
    if (!config?.id) return;

    try {
      // On passe le judge_token dans le corps de la requête POST (plus propre pour envoyer des données)
      const res = await Instance.post(
        `/api/config/${config.id}/get-judge-number`,
        {
          judge_token: judgeToken,
        },
      );

      const numeroAttribue = res.data.juge_numero;

      // On met à jour le localStorage pour tes autres fonctions (comme envoyerAction)
      localStorage.setItem("juge_numero", numeroAttribue);

      console.log(`Tablette synchronisée : Juge N°${numeroAttribue}`);
    } catch (err) {
      console.error(
        "Erreur d'attribution ou de rafraîchissement de chaise :",
        err.response?.data?.message || err.message,
      );
    }
  }, [config?.id]);

  // 3. Gestion du cycle de vie (Premier appel + Heartbeat)
  useEffect(() => {
    if (!config?.id) return;

    // Appel immédiat au montage ou quand la config change
    initialiserTablette();

    // Configuration du Heartbeat (toutes les 15 secondes)
    const interval = setInterval(() => {
      initialiserTablette();
    }, 15000);

    // Nettoyage de l'intervalle si le juge quitte l'écran ou change de config
    return () => clearInterval(interval);
  }, [config?.id, initialiserTablette]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton
          variant="rectangular"
          height={120}
          sx={{ mb: 2, borderRadius: 3 }}
        />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (!combat) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography sx={{ color: C.muted }}>Aucun combat en cours</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.bg, pb: 4, px: 2, pt: 2 }}>
      {/* Combat en cours */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          bgcolor: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* AKA */}
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Chip
              label="AKA"
              size="small"
              sx={{
                bgcolor: C.akaLight,
                color: C.aka,
                fontWeight: 700,
                mb: 0.5,
              }}
            />
            <Typography
              sx={{ fontWeight: 800, color: C.text, fontSize: "0.95rem" }}
              noWrap
            >
              {combat?.inscription_aka?.athlete?.fullname ?? "—"}
            </Typography>
            <Typography
              sx={{ fontSize: "2rem", fontWeight: 900, color: C.aka }}
            >
              {combat?.score_final_aka ?? 0}
            </Typography>
          </Box>
          <ChronoCombat combat={combat} canControl={true} />

          {/* <Typography
            sx={{ color: C.muted, fontWeight: 700, fontSize: "1.2rem" }}
          >
            VS
          </Typography> */}
          {/* AO */}
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Chip
              label="AO"
              size="small"
              sx={{ bgcolor: C.aoLight, color: C.ao, fontWeight: 700, mb: 0.5 }}
            />
            <Typography
              sx={{ fontWeight: 800, color: C.text, fontSize: "0.95rem" }}
              noWrap
            >
              {combat?.inscription_ao?.athlete?.fullname ?? "—"}
            </Typography>
            <Typography sx={{ fontSize: "2rem", fontWeight: 900, color: C.ao }}>
              {combat?.score_final_ao ?? 0}
            </Typography>
          </Box>
        </Stack>
        <PenaliteDisplay combat={combat} />

        {/* Senshu */}
        {combat?.senshu_id && (
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Chip
              label={`Senshu → ${combat.senshu_id === combat.inscription_aka_id ? "AKA" : "AO"}`}
              size="small"
              sx={{ bgcolor: "#f59e0b20", color: "#f59e0b", fontWeight: 700 }}
            />
          </Box>
        )}
      </Paper>

      {/* Dernière action envoyée */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Paper
              sx={{
                p: 1,
                mb: 2,
                borderRadius: 2,
                bgcolor: C.card,
                border: `1px solid ${C.border}`,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: C.muted, fontSize: "0.7rem" }}>
                Dernière action envoyée
              </Typography>
              <Typography
                sx={{
                  color: lastAction.combattant === "aka" ? C.aka : C.ao,
                  fontWeight: 700,
                }}
              >
                {lastAction.combattant.toUpperCase()} — {lastAction.label}
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boutons AKA */}
      <Typography
        sx={{
          color: C.aka,
          fontWeight: 700,
          mb: 1,
          fontSize: "0.8rem",
          letterSpacing: 1,
        }}
      >
        POINTS AKA
      </Typography>
      <Stack direction="row" gap={1} mb={2} flexWrap="wrap">
        {ACTIONS.points.map((action) => {
          const key = `aka-${action.type}`;
          return (
            <Button
              key={key}
              variant="contained"
              disabled={!!sending}
              onClick={() => envoyerAction("aka", action.type, action.valeur)}
              sx={{
                flex: 1,
                minWidth: 80,
                bgcolor: C.aka,
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: "#dc2626" },
                "&.Mui-disabled": { bgcolor: `${C.aka}50` },
              }}
            >
              {sending === key ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
                    {action.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
                    {action.valeur}pt
                  </Typography>
                </Box>
              )}
            </Button>
          );
        })}
      </Stack>

      {/* Boutons AO */}
      <Typography
        sx={{
          color: C.ao,
          fontWeight: 700,
          mb: 1,
          fontSize: "0.8rem",
          letterSpacing: 1,
        }}
      >
        POINTS AO
      </Typography>
      <Stack direction="row" gap={1} mb={2} flexWrap="wrap">
        {ACTIONS.points.map((action) => {
          const key = `ao-${action.type}`;
          return (
            <Button
              key={key}
              variant="contained"
              disabled={!!sending}
              onClick={() => envoyerAction("ao", action.type, action.valeur)}
              sx={{
                flex: 1,
                minWidth: 80,
                bgcolor: C.ao,
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: "#2563eb" },
                "&.Mui-disabled": { bgcolor: `${C.ao}50` },
              }}
            >
              {sending === key ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
                    {action.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
                    {action.valeur}pt
                  </Typography>
                </Box>
              )}
            </Button>
          );
        })}
      </Stack>

      {/* Pénalités */}
      <Typography
        sx={{
          color: C.penalty,
          fontWeight: 700,
          mb: 1,
          fontSize: "0.8rem",
          letterSpacing: 1,
        }}
      >
        PÉNALITÉS
      </Typography>
      <Stack direction="column" gap={1} mb={2}>
        {ACTIONS.penalites.map((action) => (
          <Stack key={action.type} direction="row" gap={1}>
            {/* Pénalité AKA */}
            <Button
              variant="outlined"
              disabled={!!sending}
              onClick={() => envoyerAction("aka", action.type, action.valeur)}
              sx={{
                flex: 1,
                borderColor: C.aka,
                color: C.aka,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: "0.7rem",
              }}
            >
              {sending === `aka-${action.type}` ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                `AKA — ${action.label}`
              )}
            </Button>
            {/* Pénalité AO */}
            <Button
              variant="outlined"
              disabled={!!sending}
              onClick={() => envoyerAction("ao", action.type, action.valeur)}
              sx={{
                flex: 1,
                borderColor: C.ao,
                color: C.ao,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: "0.7rem",
              }}
            >
              {sending === `ao-${action.type}` ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                `AO — ${action.label}`
              )}
            </Button>
          </Stack>
        ))}
      </Stack>

      {/* Prochain combat */}
      {nextCombat && (
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <Typography sx={{ color: C.muted, fontSize: "0.65rem", mb: 0.5 }}>
            PROCHAIN COMBAT
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Typography
              sx={{ color: C.aka, fontWeight: 600, fontSize: "0.85rem" }}
            >
              {nextCombat?.insc?.athlete?.fullname ?? "—"}
            </Typography>
            <Typography sx={{ color: C.muted, fontSize: "0.8rem" }}>
              vs
            </Typography>
            <Typography
              sx={{ color: C.ao, fontWeight: 600, fontSize: "0.85rem" }}
            >
              {nextCombat?.inscri?.athlete?.fullname ?? "—"}
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
