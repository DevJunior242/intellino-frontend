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
import HansokuButton from "./HansokuButton";
import CombatEnCours from "./CombatEnCours";
import VainqueurOverlay from "./VainqueurOverlay";
import ProchainCombat from "./ProchainCombat";
import HanteiButton from "./HanteiButton";
import { getApiErrorMessage } from "../../Utils/handleApiError";

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
  ///

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
      console.log("Combat en cours:", combatRes);
      console.log("Prochain combat:", nextRes);
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
      setError({ [config.id]: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };
  const handleSuivant = async () => {
    setSubmitting(true);
    setError({});
    setSuccess("");
    try {
      const res = await Instance.post(
        `/api/configs/${config.id}/combat-suivant`,
      );
      console.log("Combat suivant:", res);
      initSeance();
      onAthleteSuivant(res.combat);
    } catch (err) {
      setError({ [config.id]: getApiErrorMessage(err) });
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
  if (loading) return <LoadingKumite />;

  return (
    <Box>
      <AnimatePresence mode="wait">
        {/* Combat en cours */}
        {combat ? (
          <CombatEnCours combat={combat} canControl={true} />
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
        {nextCombat && <ProchainCombat nextCombat={nextCombat} />}
        <HanteiButton
          combat={combat}
          error={error}
          setError={setError}
          config={config}
          success={success}
          setSuccess={setSuccess}
        />
        <HansokuButton
          combat={combat}
          error={error}
          setError={setError}
          config={config}
          success={success}
          setSuccess={setSuccess}
        />

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
            disabled={
              submitting ||
              (combat?.status === 1 && !combat?.vainqueur_id) ||
              (combat?.status === 3 && !combat?.vainqueur_id)
            }
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
            ) : combat?.status === 1 && !combat?.vainqueur_id ? (
              "En cours..."
            ) : combat?.status === 3 && !combat?.vainqueur_id ? (
              "Désigner vainqueur (Hantei)"
            ) : (
              "Combat suivant →"
            )}
          </Button>
        </motion.div>
      </AnimatePresence>
      <VainqueurOverlay combat={combat} onClose={getCombatEnCours} />
    </Box>
  );
}
