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
import ChronoCombat from "./ChronoCombat";
import PenaliteDisplay from "./PenaliteDisplay";
import VainqueurOverlay from "./VainqueurOverlay";
import LoadingKumite from "./LoadingKumite";
import ProchainCombat from "./ProchainCombat";
import { getApiErrorMessage } from "../../Utils/handleApiError";
import useCompetitionTheme from "./useCompetitionTheme";

// Couleurs des coins de combat (Aka rouge / Ao bleu) : identité fixe, indépendante du thème.
const CORNER = {
  aka: "#ef4444",
  ao: "#3b82f6",
  penalty: "#f59e0b",
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
  penalites: [{ type: "penalite", label: "Pénalité", valeur: 0 }],
};

export default function KumiteArbitre({ config }) {
  const T = useCompetitionTheme();
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
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
    setError({});
    setSuccess("");

    try {
      const jugeNumero = parseInt(localStorage.getItem("juge_numero")) || 1;

      const clientTimestamp = new Date().toISOString();

      const res = await Instance.post("/api/combat-actions", {
        combat_id: combat.id,
        juge_numero: jugeNumero,
        combattant, // 'aka' ou 'ao'
        type, // 'yuko', 'waza_ari', 'ippon', 'penalite'
        valeur,
        client_timestamp: clientTimestamp,
      });

      setLastAction({
        combattant,
        type,
        label: ACTIONS.points.find((a) => a.type === type)?.label || type,
      });
      if (res.data?.message) setSuccess(res.data.message || "action envoyée");
    } catch (err) {
      setError({ [config.id]: getApiErrorMessage(err) });
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
    return <LoadingKumite />;
  }

  if (!combat) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography sx={{ color: T.textMuted }}>Aucun combat en cours</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg, pb: 4, px: 2, pt: 2 }}>
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
                bgcolor: T.surface,
                border: `1px solid ${T.border}`,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: T.textMuted, fontSize: "0.7rem" }}>
                Dernière action envoyée
              </Typography>
              <Typography
                sx={{
                  color: lastAction.combattant === "aka" ? CORNER.aka : CORNER.ao,
                  fontWeight: 700,
                }}
              >
                {lastAction.combattant.toUpperCase()} — {lastAction.label}
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      <VainqueurOverlay combat={combat} />

      {/* Conteneur principal */}
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        {/* Ligne des boutons de points (AKA et AO côte à côte) */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
          }}
        >
          {/* Boutons AKA */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              minWidth: "150px",
            }}
          >
            <Typography
              sx={{
                color: CORNER.aka,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: 1,
                textAlign: "center",
                width: "100%",
                mb: 1,
              }}
            >
              POINTS AKA
            </Typography>
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              justifyContent="center"
            >
              {ACTIONS.points.map((action) => {
                const key = `aka-${action.type}`;
                return (
                  <Button
                    key={key}
                    variant="contained"
                    disabled={!!sending || combat?.vainqueur_id}
                    onClick={() =>
                      envoyerAction("aka", action.type, action.valeur)
                    }
                    sx={{
                      minWidth: "70px",
                      height: "50px",
                      bgcolor: CORNER.aka,
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#dc2626" },
                      "&.Mui-disabled": { bgcolor: `${CORNER.aka}50` },
                    }}
                  >
                    {sending === key ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                        >
                          {action.label}
                        </Typography>
                        <Typography sx={{ fontSize: "0.65rem", opacity: 0.8 }}>
                          {action.valeur}pt
                        </Typography>
                      </Box>
                    )}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* Boutons AO */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              minWidth: "150px",
            }}
          >
            <Typography
              sx={{
                color: CORNER.ao,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: 1,
                textAlign: "center",
                width: "100%",
                mb: 1,
              }}
            >
              POINTS AO
            </Typography>
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              justifyContent="center"
            >
              {ACTIONS.points.map((action) => {
                const key = `ao-${action.type}`;
                return (
                  <Button
                    key={key}
                    variant="contained"
                    disabled={!!sending || combat?.vainqueur_id}
                    onClick={() =>
                      envoyerAction("ao", action.type, action.valeur)
                    }
                    sx={{
                      minWidth: "70px",
                      height: "50px",
                      bgcolor: CORNER.ao,
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#2563eb" },
                      "&.Mui-disabled": { bgcolor: `${CORNER.ao}50` },
                    }}
                  >
                    {sending === key ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                        >
                          {action.label}
                        </Typography>
                        <Typography sx={{ fontSize: "0.65rem", opacity: 0.8 }}>
                          {action.valeur}pt
                        </Typography>
                      </Box>
                    )}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* Ligne des boutons de fautes (AKA et AO côte à côte) */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
          }}
        >
          {/* Bouton de faute AKA */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              minWidth: "150px",
            }}
          >
            <Typography
              sx={{
                color: CORNER.penalty,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: 1,
                textAlign: "center",
                width: "100%",
                mb: 1,
              }}
            >
              FAUTE AKA
            </Typography>
            <Button
              variant="outlined"
              disabled={!!sending || combat?.vainqueur_id}
              onClick={() => envoyerAction("aka", "penalite", 0)}
              sx={{
                width: "100%",
                height: "50px",
                borderColor: CORNER.aka,
                color: CORNER.aka,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: "0.8rem",
              }}
            >
              {sending === "aka-penalite" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Faute AKA"
              )}
            </Button>
          </Box>

          {/* Bouton de faute AO */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              minWidth: "150px",
            }}
          >
            <Typography
              sx={{
                color: CORNER.penalty,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: 1,
                textAlign: "center",
                width: "100%",
                mb: 1,
              }}
            >
              FAUTE AO
            </Typography>
            <Button
              variant="outlined"
              disabled={!!sending || combat?.vainqueur_id}
              onClick={() => envoyerAction("ao", "penalite", 0)}
              sx={{
                width: "100%",
                height: "50px",
                borderColor: CORNER.ao,
                color: CORNER.ao,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: "0.8rem",
              }}
            >
              {sending === "ao-penalite" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Faute AO"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
