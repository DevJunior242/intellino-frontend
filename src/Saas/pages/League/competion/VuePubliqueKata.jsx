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
import { Instance } from "../../../../Api/Axios";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBlock from "../../ErrorBlock";
import echo from "../../../../echo";

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

// Animation de zoom pour le score
const zoomIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 10 },
  },
};

// Animation de défilement pour le classement
const scrollIn = {
  initial: { x: -50, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

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
  const { configId } = useParams();
  const [data, setData] = useState(null);
  const [nextAthlete, setNextAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    });
    channel.listen(".note.ajoutee", () => {
      fetchVuePublique();
    });
    return () => {
      echo.leaveChannel(`tatami.${configId}`);
    };
  }, [fetchVuePublique, configId]);

  // Calcul des notes avec statut (éliminées ou non)
  const getNotesAvecStatut = useCallback((notes = [], nbJuges) => {
    if (notes.length < nbJuges) {
      return notes.map((n) => ({ ...n, elimine: false }));
    }

    const sorted = [...notes].sort((a, b) => a.valeur - b.valeur);
    const eliminer = nbJuges === 7 ? 2 : 1;
    const mins = sorted.slice(0, eliminer).map((n) => n.valeur);
    const maxs = sorted.slice(-eliminer).map((n) => n.valeur);

    let minsLeft = eliminer;
    let maxsLeft = eliminer;

    return notes.map((n) => {
      if (minsLeft > 0 && mins.includes(n.valeur)) {
        minsLeft--;
        return { ...n, elimine: true };
      }
      if (maxsLeft > 0 && maxs.includes(n.valeur)) {
        maxsLeft--;
        return { ...n, elimine: true };
      }
      return { ...n, elimine: false };
    });
  }, []);

  // Données mémoïsées
  const { enCours, score, classement, nbJuges, notesAvecStatut } =
    useMemo(() => {
      if (!data) {
        return {
          enCours: null,
          notes: [],
          score: null,
          classement: [],
          nbJuges: 5,
          eliminer: 1,
          notesAvecStatut: [],
        };
      }

      const nbJuges = data?.config?.juges_option || 5;
      const eliminer = nbJuges === 7 ? 2 : 1;
      const notesAvecStatut = getNotesAvecStatut(data?.notes || [], nbJuges);

      return {
        enCours: data?.enCours,
        notes: data?.notes || [],
        score: data?.score,
        classement: data?.classement || [],
        nbJuges,
        eliminer,
        notesAvecStatut,
      };
    }, [data, getNotesAvecStatut]);

  const medailles = ["🥇", "🥈", "🥉"];

  // Affichage du loading
  if (loading) {
    return (
      <Box
        sx={{
          ...loadingContainer,
          bgcolor: "#1a1a2e",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <EmojiEvents sx={loadingIcon} />
        </motion.div>
        <Typography variant="h6" color="#f0a500" fontWeight="bold">
          Chargement en cours...
        </Typography>
        <CircularProgress color="inherit" size={24} />
      </Box>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return <ErrorBlock message={error} onRetry={fetchVuePublique} />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121217",
        p: { xs: 1, sm: 2, md: 3 },
        background: `
          linear-gradient(45deg, #121217, #1a1a2e, #121217, #1a1a2e),
          linear-gradient(90deg, rgba(240,165,0,0.03), rgba(0, 180, 216, 0.03), rgba(240,165,0,0.03))
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
                  bgcolor: "#1e1e30",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="#f0a500">
                  {enCours?.inscription?.competition?.evenement?.nom ?? "—"} -{" "}
                  {enCours?.inscription?.competition?.evenement?.lieu ?? "—"}
                </Typography>
                <Typography variant="h6" color="rgba(255,255,255,0.7)" mt={0.5}>
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
                    background: `
                      linear-gradient(
                        135deg,
                        #050505 0%,
                        #111111 25%,
                        #1a1200 60%,
                        #3b2a00 100%
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
                    color="#f0a500"
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
                  <Typography color="rgba(255,255,255,0.7)" mt={0.5}>
                    {enCours?.inscription?.organisateur?.name ?? "—"} · Passage
                    N°
                    {enCours?.ordre ?? "—"}
                  </Typography>
                  <Typography color="rgba(255,255,255,0.7)">
                    Kata : {enCours.inscription?.kata ?? "—"}
                  </Typography>
                </Paper>
              </motion.div>
            ) : (
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: "#1e1e30",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Typography color="rgba(255,255,255,0.5)">
                  En attente du prochain athlète...
                </Typography>
              </Paper>
            )}
          </motion.div>

          {/* Prochain athlète */}
          {nextAthlete && (
            <motion.div initial="initial" animate="animate" variants={slideIn}>
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 4,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  background: `
                    linear-gradient(
                      135deg,
                      #001a1a 0%,
                      #002222 25%,
                      #003333 60%,
                      #004444 100%
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
                    color="#00b4d8"
                    fontWeight="bold"
                    letterSpacing={2}
                  >
                    PROCHAIN ATHLÈTE
                  </Typography>
                </motion.div>
                <Typography
                  variant="h3"
                  fontWeight="900"
                  color="#00d4ff"
                  mt={1}
                >
                  {nextAthlete?.inscription?.athlete?.fullname ?? "—"}
                </Typography>
                <Typography color="rgba(255,255,255,0.7)" mt={0.5}>
                  {nextAthlete?.inscription?.organisateur?.name ?? "—"} ·
                  Passage N°
                  {nextAthlete?.ordre ?? "—"}
                </Typography>
                <Typography color="rgba(255,255,255,0.7)">
                  Kata : {nextAthlete.inscription?.kata ?? "—"}
                </Typography>
              </Paper>
            </motion.div>
          )}

          {/* Notes des juges */}
          <motion.div variants={staggerItem}>
            <Typography
              variant="body2"
              color="rgba(255,255,255,0.5)"
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
                const note = notesAvecStatut[i];
                const aNote = !!note;
                const elimine = note?.elimine;

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
                        p: 2,
                        minWidth: 110,
                        flex: 1,
                        maxWidth: 140,
                        borderRadius: 3,
                        textAlign: "center",
                        bgcolor: elimine
                          ? "rgba(107, 44, 44, 0.8)"
                          : aNote
                            ? "rgba(26, 92, 58, 0.8)"
                            : "#1e1e30",
                        border: "1px solid",
                        borderColor: elimine
                          ? "#993c1d"
                          : aNote
                            ? "#1d9e75"
                            : "rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="rgba(255,255,255,0.6)"
                      >
                        Juge {i + 1}
                      </Typography>

                      {aNote ? (
                        <>
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Typography
                              variant="h4"
                              fontWeight="900"
                              color="white"
                              sx={{
                                textDecoration: elimine
                                  ? "line-through"
                                  : "none",
                                opacity: elimine ? 0.6 : 1,
                                mt: 1,
                              }}
                            >
                              {note.valeur.toFixed(1)}
                            </Typography>
                          </motion.div>
                          {elimine && (
                            <Typography variant="caption" color="#f09595">
                              éliminé
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography
                          variant="h4"
                          color="rgba(255,255,255,0.2)"
                          mt={1}
                        >
                          —
                        </Typography>
                      )}
                    </Paper>
                  </motion.div>
                );
              })}
            </Stack>
          </motion.div>

          {/* Score final */}
          <motion.div variants={staggerItem}>
            <motion.div initial="initial" animate="animate" variants={zoomIn}>
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: score ? "#1e1e30" : "#121217",
                  textAlign: "center",
                  boxShadow: score
                    ? "0 6px 25px rgba(74, 63, 140, 0.5)"
                    : "0 4px 20px rgba(0, 0, 0, 0.3)",
                  border: score ? "1px solid #4a3f8c" : "none",
                  transition: "all 0.5s",
                }}
              >
                {score ? (
                  <>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.6)"
                      mb={1}
                    >
                      Score final (
                      {notesAvecStatut
                        .filter((n) => !n.elimine)
                        .map((n) => n.valeur.toFixed(1))
                        .join(" + ")}
                      )
                    </Typography>
                    <Typography variant="h2" fontWeight="900" color="#f0a500">
                      {score}
                    </Typography>
                  </>
                ) : (
                  <Typography color="rgba(255,255,255,0.4)">
                    Score final — en attente des notes
                  </Typography>
                )}
              </Paper>
            </motion.div>
          </motion.div>

          {/* Classement provisoire */}
          {classement.length > 0 && (
            <motion.div variants={staggerItem}>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.5)"
                textAlign="center"
                mb={1.5}
              >
                Classement provisoire
              </Typography>

              <Stack spacing={1}>
                {classement.map((item, index) => (
                  <motion.div
                    key={index}
                    initial="initial"
                    animate="animate"
                    variants={scrollIn}
                    custom={index}
                    whileHover={{
                      x: 5,
                      boxShadow: "0 8px 25px rgba(218, 165, 32, 0.4)",
                    }}
                  >
                    <Paper
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        borderRadius: 3,
                        bgcolor: index === 0 ? "#2a1810" : "#1e1e30",
                        border: "1px solid",
                        borderColor:
                          index === 0 ? "#f0a500" : "rgba(255, 255, 255, 0.1)",
                        boxShadow:
                          index === 0
                            ? "0 6px 20px rgba(218, 165, 32, 0.3)"
                            : "0 4px 10px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Stack direction="row" alignItems="center" gap={2}>
                          <Typography fontSize={20}>
                            {medailles[index] || `${index + 1}.`}
                          </Typography>
                          <Box>
                            <Typography fontWeight="bold" color="white">
                              {item.athlete}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="rgba(255,255,255,0.5)"
                            >
                              {item.organisateur}
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={index === 0 ? "#f0a500" : "white"}
                        >
                          {item.score}
                        </Typography>
                      </Stack>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
