import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Fade,
  Zoom,
  keyframes,
} from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";
import { Instance } from "../../../../Api/Axios";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBlock from "../../ErrorBlock";
import echo from "../../../../echo";
import LoadingKumite from "./LoadingKumite";
import PublicDisplayThemeProvider from "./PublicDisplayThemeProvider";
import useCompetitionTheme from "./useCompetitionTheme";
import DuelKataEnCours from "./DuelKataEnCours";
import BracketViewer from "./BracketViewer";
import VainqueurOverlay from "./VainqueurOverlay";

// --- Animations Framer Motion ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Animation de pulsation pour le nom de l'athlète en cours
const pulse = {
  animate: {
    scale: [1, 1.02, 1],
    textShadow: [
      "0 0 5px rgba(240, 165, 0, 0.5)",
      "0 0 10px rgba(240, 165, 0, 0.8)",
      "0 0 5px rgba(240, 165, 0, 0.5)",
    ],
  },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};

// Couleurs des coins de combat (Aka rouge / Ao bleu) : identité fixe, indépendante du thème.
const CORNER = { aka: "#ef4444", ao: "#3b82f6" };

// Le capitaine d'une équipe Kata garde un athlete_id (contrainte BDD), donc
// kata_team prime sur athlete ici, sinon une équipe s'affiche sous le nom de
// son capitaine.
function nomInscriptionCombat(inscription) {
  return inscription?.kata_team?.nom ?? inscription?.athlete?.fullname ?? "—";
}

// Animation de glissement pour le prochain athlète
const slideIn = {
  initial: { x: 100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 10 },
  },
};

// Animation de rebond pour les notes des juges
const bounceIn = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 10 },
  },
};

// Compte à rebours de 35 secondes entre l'appel de l'athlète et le premier
// mouvement après le salut (WKF Kata Competition Rules, Art. 6.6).
const DUREE_APPEL_SECONDES = 35;

function CompteARebours({ departAt }) {
  const [maintenant, setMaintenant] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setMaintenant(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  if (!departAt) return null;

  const ecouleSecondes = (maintenant - new Date(departAt).getTime()) / 1000;
  const restant = Math.ceil(DUREE_APPEL_SECONDES - ecouleSecondes);

  if (restant <= 0) return null;

  return (
    <Typography
      sx={{
        mt: 1,
        fontWeight: 900,
        fontSize: "1.4rem",
        color: restant <= 10 ? "#ef4444" : "#f0a500",
      }}
    >
      {restant}s
    </Typography>
  );
}

// Animation de fond (dégradé dynamique)
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Animation pour le loading
const loadingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  gap: 2,
};

const loadingIcon = {
  width: 60,
  height: 60,
  color: "#f0a500",
};

export default function VuePubliqueKata() {
  const theme = useTheme();
  const T = useCompetitionTheme();
  const { configId } = useParams();
  const [data, setData] = useState(null);
  const [nextAthlete, setNextAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [combat, setCombat] = useState(null);
  const [votesJuges, setVotesJuges] = useState([]);

  const fetchCombat = useCallback(async () => {
    if (!configId) return;
    try {
      const res = await Instance.get(
        `/api/public/configs/${configId}/combat-en-cours`,
      );
      setCombat(res.data?.combat || null);
      setVotesJuges(res.data?.votes_juges || []);
    } catch (err) {
      console.error(err);
    }
  }, [configId]);

  useEffect(() => {
    fetchCombat();
  }, [fetchCombat]);

  const fetchVuePublique = useCallback(async () => {
    // setLoading(true);
    try {
      const [vueRes, nextRes] = await Promise.all([
        Instance.get(`/api/configs/${configId}/vue-publique`),
        Instance.get(`/api/configs/${configId}/next-athlete`),
      ]);

      setData(vueRes.data);
      const nextData = nextRes.data ?? null;
      setNextAthlete(nextData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(
        "Impossible de charger les données. Veuillez réessayer plus tard.",
      );
      setLoading(false);
    }
  }, [configId]);

  useEffect(() => {
    if (!configId) return;
    fetchVuePublique();
  }, [configId]);

  // Echo pour les mises à jour en temps réel
  useEffect(() => {
    if (!configId) return;
    const channel = echo.channel(`tatami.${configId}`);
    channel.listen(".tatami.updated", () => {
      fetchVuePublique();
      fetchCombat();
    });
    channel.listen(".note.ajoutee", () => {
      fetchVuePublique();
      fetchCombat();
    });
    return () => {
      echo.leaveChannel(`tatami.${configId}`);
    };
  }, [fetchVuePublique, fetchCombat, configId]);

  // Données mémoïsées
  const { enCours, nbJuges } = useMemo(() => {
    if (!data) {
      return {
        enCours: null,
        nbJuges: 5,
      };
    }

    return {
      enCours: data?.enCours,
      nbJuges: data?.config?.juges_option || 5,
    };
  }, [data]);

  // Détail des votes par juge (AKA/AO côte à côte), indexé par poste.
  const votesJugesParPoste = useMemo(() => {
    const parPoste = {};
    for (const ligne of votesJuges) {
      if (ligne.poste != null) parPoste[ligne.poste] = ligne;
    }
    return parPoste;
  }, [votesJuges]);

  if (loading)
    return (
      <PublicDisplayThemeProvider>
        <LoadingKumite />
      </PublicDisplayThemeProvider>
    );

  // Affichage en cas d'erreur
  if (error) {
    return (
      <PublicDisplayThemeProvider>
        <ErrorBlock message={error} onRetry={fetchVuePublique} />
      </PublicDisplayThemeProvider>
    );
  }

  const isDark = theme.palette.mode === "dark";

  return (
    <PublicDisplayThemeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: T.bg,
          p: { xs: 1, sm: 2, md: 3 },
          background: isDark
            ? `
            linear-gradient(45deg, #121217, #1a1a2e, #121217, #1a1a2e),
            linear-gradient(90deg, rgba(240,165,0,0.03), rgba(0, 180, 216, 0.03), rgba(240,165,0,0.03))
          `
            : `
            linear-gradient(45deg, #fcfcfc, #f0f1f6, #fcfcfc, #f0f1f6),
            linear-gradient(90deg, rgba(240,165,0,0.05), rgba(0, 180, 216, 0.05), rgba(240,165,0,0.05))
          `,
          backgroundSize: "400% 400%, 100% 100%",
          animation: `${gradientAnimation} 20s ease infinite`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Header compétition */}
            {enCours && (
              <motion.div variants={staggerItem}>
                <Paper
                  sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: T.surfaceHigh,
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    border: "1px solid",
                    borderColor: T.border,
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" color={T.accent}>
                    {enCours?.inscription?.competition?.evenement?.nom ?? "—"} -{" "}
                    {enCours?.inscription?.competition?.evenement?.lieu ?? "—"}
                  </Typography>
                  <Typography variant="h6" color="secondary" mt={0.5}>
                    {enCours?.inscription?.competition?.category?.nom ?? "—"} (
                    {enCours?.inscription?.competition?.category?.sexe ?? "—"})
                  </Typography>
                </Paper>
              </motion.div>
            )}

            {/* Athlète en cours */}
            <motion.div variants={staggerItem}>
              {enCours ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 80 }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: 4,
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                      background: isDark
                        ? `
                        linear-gradient(
                          135deg,
                          #050505 0%,
                          #111111 25%,
                          #1a1200 60%,
                          #3b2a00 100%
                        )
                      `
                        : `
                        linear-gradient(
                          135deg,
                          #ffffff 0%,
                          #fffaf0 25%,
                          #fff3d6 60%,
                          #ffe6a8 100%
                        )
                      `,
                      border: "1px solid rgba(240,165,0,0.45)",
                      boxShadow: `
                      0 0 12px rgba(240,165,0,0.18),
                      0 8px 30px rgba(0,0,0,0.75)
                    `,
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `
                        linear-gradient(
                          120deg,
                          transparent 20%,
                          rgba(255,215,0,0.08) 50%,
                          transparent 80%
                        )
                      `,
                        pointerEvents: "none",
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={T.accent}
                      fontWeight="bold"
                      letterSpacing={2}
                    >
                      EN COURS
                    </Typography>
                    <motion.div {...pulse}>
                      <Typography
                        variant="h3"
                        fontWeight="900"
                        color="primary.main"
                        mt={1}
                      >
                        {enCours?.inscription?.athlete?.fullname ?? "—"}
                      </Typography>
                    </motion.div>
                    <Typography color={alpha(T.text, 0.7)} mt={0.5}>
                      {enCours?.inscription?.organisateur?.name ?? "—"} ·
                      Passage N°
                      {enCours?.ordre ?? "—"}
                    </Typography>
                    <Typography color={alpha(T.text, 0.7)}>
                      Kata : {enCours.kata?.nom ?? "—"}
                    </Typography>
                    <CompteARebours departAt={enCours.updated_at} />
                  </Paper>
                </motion.div>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: T.surfaceHigh,
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Typography color={alpha(T.text, 0.5)}>
                    En attente du prochain athlète...
                  </Typography>
                </Paper>
              )}
            </motion.div>

            {/* Duel en cours (adversaire, étape, phase Kata/Bunkai) */}
            {enCours && (
              <motion.div variants={staggerItem}>
                <DuelKataEnCours passage={enCours} />
              </motion.div>
            )}

            {/* Prochain athlète */}
            {nextAthlete && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={slideIn}
              >
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 4,
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    background: isDark
                      ? `
                      linear-gradient(
                        135deg,
                        #001a1a 0%,
                        #002222 25%,
                        #003333 60%,
                        #004444 100%
                      )
                    `
                      : `
                      linear-gradient(
                        135deg,
                        #ffffff 0%,
                        #f0fbfd 25%,
                        #dcf4f9 60%,
                        #c3ecf5 100%
                      )
                    `,
                    border: "1px solid rgba(0, 180, 216, 0.45)",
                    boxShadow: `
                    0 0 12px rgba(0, 180, 216, 0.18),
                    0 8px 30px rgba(0,0,0,0.75)
                  `,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background: `
                      linear-gradient(
                        120deg,
                        transparent 20%,
                        rgba(0, 216, 255, 0.08) 50%,
                        transparent 80%
                      )
                    `,
                      pointerEvents: "none",
                    },
                  }}
                >
                  <motion.div
                    animate={{
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Typography
                      variant="caption"
                      color={theme.palette.info.main}
                      fontWeight="bold"
                      letterSpacing={2}
                    >
                      PROCHAIN ATHLÈTE
                    </Typography>
                  </motion.div>
                  <Typography
                    variant="h3"
                    fontWeight="900"
                    color={theme.palette.info.main}
                    mt={1}
                  >
                    {nextAthlete?.inscription?.athlete?.fullname ?? "—"}
                  </Typography>
                  <Typography color={alpha(T.text, 0.7)} mt={0.5}>
                    {nextAthlete?.inscription?.organisateur?.name ?? "—"} ·
                    Passage N°
                    {nextAthlete?.ordre ?? "—"}
                  </Typography>
                  <Typography color={alpha(T.text, 0.7)}>
                    Kata : {nextAthlete.kata?.nom ?? "—"}
                  </Typography>
                </Paper>
              </motion.div>
            )}

            {/* Notes des juges — AKA et AO côte à côte pour chaque juge,
                avec le vote de ce juge (Art. 5.4.2 : comparaison relative
                de ses deux propres notes), façon feuille de match WKF. */}
            <motion.div variants={staggerItem}>
              <Typography
                variant="body2"
                color={alpha(T.text, 0.5)}
                textAlign="center"
                mb={1.5}
              >
                Notes des juges
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                mb={3}
                justifyContent="center"
                flexWrap="wrap"
              >
                {Array.from({ length: nbJuges }, (_, i) => {
                  const ligne = votesJugesParPoste[i + 1];
                  const noteAka = ligne?.note_aka;
                  const noteAo = ligne?.note_ao;
                  const vote = ligne?.vote ?? null;
                  const aUneNote = noteAka != null || noteAo != null;
                  const voteCouleur =
                    vote === "aka"
                      ? CORNER.aka
                      : vote === "ao"
                        ? CORNER.ao
                        : T.border;

                  return (
                    <motion.div
                      key={i}
                      initial="initial"
                      animate="animate"
                      variants={bounceIn}
                      custom={i}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          minWidth: 100,
                          flex: 1,
                          maxWidth: 130,
                          borderRadius: 3,
                          textAlign: "center",
                          bgcolor: aUneNote ? T.surfaceHigh : alpha(T.border, 0.15),
                          border: "2px solid",
                          borderColor: voteCouleur,
                          transition: "all 0.3s",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color={alpha(T.text, 0.6)}
                        >
                          Juge {i + 1}
                        </Typography>
                        {ligne?.juge && (
                          <Typography
                            noWrap
                            sx={{
                              fontSize: "0.62rem",
                              color: alpha(T.text, 0.45),
                              maxWidth: 105,
                              mx: "auto",
                            }}
                          >
                            {ligne.juge}
                          </Typography>
                        )}

                        <Stack spacing={0.3} mt={0.5}>
                          <Typography
                            fontWeight="900"
                            sx={{
                              fontSize: "1.15rem",
                              color: noteAka != null ? CORNER.aka : alpha(T.text, 0.2),
                            }}
                          >
                            {noteAka != null ? noteAka.toFixed(1) : "—"}
                          </Typography>
                          <Typography
                            fontWeight="900"
                            sx={{
                              fontSize: "1.15rem",
                              color: noteAo != null ? CORNER.ao : alpha(T.text, 0.2),
                            }}
                          >
                            {noteAo != null ? noteAo.toFixed(1) : "—"}
                          </Typography>
                        </Stack>

                        {/* Vote de ce juge */}
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: voteCouleur,
                            mx: "auto",
                            mt: 1,
                          }}
                        />
                      </Paper>
                    </motion.div>
                  );
                })}
              </Stack>
            </motion.div>

            {/* Résultat du duel — vote des juges (Art. 5.4.2/5.5.1 WKF : le
                vainqueur est désigné à la majorité des votes, pas par un
                score absolu) */}
            {combat?.votes_aka != null && (
              <motion.div variants={staggerItem}>
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: T.surfaceHigh,
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Typography
                    sx={{
                      color: alpha(T.text, 0.5),
                      fontSize: "0.7rem",
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      mb: 1.5,
                    }}
                  >
                    {combat.vainqueur_id
                      ? "Résultat — vote des juges"
                      : "Vote des juges à égalité — décision du superviseur en attente"}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    gap={{ xs: 2, sm: 4 }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: CORNER.aka,
                          fontWeight: 700,
                          fontSize: { xs: "0.75rem", sm: "0.9rem" },
                          mb: 0.5,
                        }}
                      >
                        {nomInscriptionCombat(combat.inscription_aka)}
                      </Typography>
                      <Typography
                        sx={{
                          color: CORNER.aka,
                          fontWeight: 900,
                          fontSize: { xs: "2rem", sm: "3rem" },
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {combat.votes_aka}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: alpha(T.text, 0.25),
                        fontSize: "1.3rem",
                        fontWeight: 700,
                      }}
                    >
                      —
                    </Typography>
                    <Box>
                      <Typography
                        sx={{
                          color: CORNER.ao,
                          fontWeight: 700,
                          fontSize: { xs: "0.75rem", sm: "0.9rem" },
                          mb: 0.5,
                        }}
                      >
                        {nomInscriptionCombat(combat.inscription_ao)}
                      </Typography>
                      <Typography
                        sx={{
                          color: CORNER.ao,
                          fontWeight: 900,
                          fontSize: { xs: "2rem", sm: "3rem" },
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {combat.votes_ao}
                      </Typography>
                    </Box>
                  </Stack>

                  {combat.vainqueur_id && (
                    <Typography
                      sx={{
                        mt: 2,
                        color: T.text,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      Vainqueur :{" "}
                      {combat.vainqueur_id === combat.inscription_aka_id
                        ? nomInscriptionCombat(combat.inscription_aka)
                        : nomInscriptionCombat(combat.inscription_ao)}
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            )}

            {/* Tableau éliminatoire */}
            <motion.div variants={staggerItem}>
              <BracketViewer configId={configId} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* <VainqueurOverlay combat={combat} onClose={fetchCombat} /> */}
      </Box>
    </PublicDisplayThemeProvider>
  );
}
