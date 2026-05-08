import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Fade,
  Zoom,
} from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { Instance } from "../../../../Api/Axios";
import { motion, AnimatePresence } from "framer-motion";

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

// Variantes pour les animations Framer Motion
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

console.log("Fichier VuePubliqueKata.js chargé");

export default function VuePubliqueKata() {
  const { configId } = useParams();
  console.log("Récupération de la configId depuis les params :", configId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des données
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await Instance.get(
        `/api/seances/configs/${configId}/vue-publique`,
      );
      console.log("Données reçues :", res.data);
      setData(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des données :", err);
      setError(
        "Impossible de charger les données. Veuillez réessayer plus tard.",
      );
    } finally {
      setLoading(false);
    }
  }, [configId]);

  // Polling toutes les 3 secondes
  useEffect(() => {
    if (!configId) return;
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData, configId]);

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

  // Données mémoïsées pour éviter les recalculs
  const {
    enCours,
    notes,
    score,
    classement,
    nbJuges,
    eliminer,
    notesAvecStatut,
  } = useMemo(() => {
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
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "#6b2c2c",
            maxWidth: 400,
          }}
        >
          <Typography variant="h6" color="#ff6b6b" fontWeight="bold" mb={2}>
            ⚠️ Erreur
          </Typography>
          <Typography color="rgba(255,255,255,0.8)">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121217",
        p: { xs: 1, sm: 2, md: 3 },
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
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: "linear-gradient(135deg, #2a1810, #4a3000)",
                  textAlign: "center",
                  boxShadow: "0 6px 25px rgba(218, 165, 32, 0.2)",
                  border: "2px solid #f0a500",
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
                <Typography variant="h3" fontWeight="900" color="white" mt={1}>
                  {enCours?.inscription?.athlete?.fullname ?? "—"}
                </Typography>
                <Typography color="rgba(255,255,255,0.7)" mt={0.5}>
                  {enCours?.inscription?.club?.name ?? "—"} · Passage N°
                  {enCours?.ordre ?? "—"}
                </Typography>
                <Typography color="rgba(255,255,255,0.7)">
                  Kata : {enCours.inscription?.kata?.nom ?? "—"}
                </Typography>
              </Paper>
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
                    variants={fadeIn}
                    whileHover={{ scale: 1.05 }}
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
                          <Typography
                            variant="h4"
                            fontWeight="900"
                            color="white"
                            sx={{
                              textDecoration: elimine ? "line-through" : "none",
                              opacity: elimine ? 0.6 : 1,
                              mt: 1,
                            }}
                          >
                            {note.valeur.toFixed(1)}
                          </Typography>
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
                  <motion.div key={index} variants={fadeIn}>
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
                              {item.club}
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
