import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Slider,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  CheckCircle,
  SportsMartialArts,
  HowToVote,
  Person,
  Tag,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { alpha } from "@mui/material/styles";
import { Instance } from "../../../../Api/Axios";
import echo from "../../../../echo";
import ProchainAthlete from "./ProchainAthlete";
import useCompetitionTheme from "./useCompetitionTheme";

// ─── Skeleton loading ─────────────────────────────────────────────────────────
const PageSkeleton = () => {
  const T = useCompetitionTheme();
  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: "auto" }}>
      {/* Barre top */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 9999,
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
            width: "40%",
          }}
          animate={{ x: ["−100%", "350%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </Box>

      {/* Skeleton athlète */}
      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
          mb: 2,
          textAlign: "center",
        }}
      >
        <Skeleton
          variant="circular"
          width={56}
          height={56}
          sx={{ bgcolor: "action.hover", mx: "auto", mb: 2 }}
        />
        <Skeleton
          variant="text"
          width="70%"
          sx={{ bgcolor: "action.hover", mx: "auto", height: 32, mb: 1 }}
        />
        <Stack direction="row" justifyContent="center" gap={1}>
          <Skeleton
            variant="rounded"
            width={90}
            height={24}
            sx={{ bgcolor: "action.hover" }}
          />
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ bgcolor: "action.hover" }}
          />
        </Stack>
      </Box>

      {/* Skeleton note */}
      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
        }}
      >
        <Skeleton
          variant="text"
          width="50%"
          sx={{ bgcolor: "action.hover", mx: "auto", height: 28, mb: 3 }}
        />
        <Skeleton
          variant="text"
          width="30%"
          sx={{ bgcolor: "action.hover", mx: "auto", height: 80, mb: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={6}
          sx={{ bgcolor: "action.hover", mb: 3 }}
        />
        <Stack direction="row" gap={1} justifyContent="center" flexWrap="wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={56}
              height={32}
              sx={{ bgcolor: "action.hover" }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

// ─── Carte athlète en cours ───────────────────────────────────────────────────
const AthleteEnCours = ({ enCours, notes, nbJuges }) => {
  const T = useCompetitionTheme();
  const notesCount = notes?.length ?? 0;
  const toutesRecues = notesCount === nbJuges;
  const progression = nbJuges > 0 ? (notesCount / nbJuges) * 100 : 0;

  return (
    <motion.div
      key={enCours?.id}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 2,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
          boxShadow: `0 0 24px ${alpha(T.accent, 0.18)}`,
        }}
      >
        {/* Fond dégradé subtil */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${alpha(T.accent, 0.18)} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Badge EN COURS */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={0.8}
          mb={1.5}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: T.success,
            }}
          />
          <Typography
            sx={{
              color: T.success,
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: 2.5,
              textTransform: "uppercase",
            }}
          >
            Athlète en cours
          </Typography>
        </Stack>

        {/* Icône */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: `${T.accent}18`,
            border: `1.5px solid ${T.accent}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 1.5,
          }}
        >
          <SportsMartialArts sx={{ color: T.accent, fontSize: 28 }} />
        </Box>

        {/* Nom */}
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.4rem", sm: "1.7rem" },
            color: T.text,
            lineHeight: 1.15,
            mb: 1,
          }}
        >
          {enCours?.inscription?.athlete?.fullname ?? "—"}
        </Typography>

        {/* Chips infos */}
        <Stack
          direction="row"
          justifyContent="center"
          gap={0.8}
          flexWrap="wrap"
          mb={2}
        >
          {/* organisateur.name */}
          {enCours?.inscription?.organisateur && (
            <Chip
              icon={
                <Tag
                  sx={{
                    fontSize: "0.75rem !important",
                    color: `${T.accent} !important`,
                  }}
                />
              }
              label={enCours?.inscription?.organisateur?.name ?? "—"}
              size="small"
              sx={{
                bgcolor: `${T.accent}15`,
                color: T.accent,
                border: `1px solid ${T.accent}30`,
                fontSize: "0.72rem",
                height: 24,
              }}
            />
          )}

          {/* athlete.fullname */}
          <Chip
            icon={
              <Tag
                sx={{
                  fontSize: "0.75rem !important",
                  color: `${T.accent} !important`,
                }}
              />
            }
            label={`Passage ${enCours?.ordre ?? "—"}`}
            size="small"
            sx={{
              bgcolor: `${T.accent}15`,
              color: T.accent,
              border: `1px solid ${T.accent}30`,
              fontSize: "0.72rem",
              height: 24,
            }}
          />
          <Chip
            icon={
              <Person
                sx={{
                  fontSize: "0.75rem !important",
                  color: `${T.textMuted} !important`,
                }}
              />
            }
            label={enCours?.inscription?.competition?.category?.nom ?? "—"}
            size="small"
            sx={{
              bgcolor: "#1e2a3a",
              color: T.textMuted,
              border: `1px solid ${T.border}`,
              fontSize: "0.72rem",
              height: 24,
            }}
          />
          {enCours?.inscription?.kata && (
            <Chip
              label={enCours.inscription.kata ?? enCours.inscription.kata}
              size="small"
              sx={{
                bgcolor: `${T.warning}12`,
                color: T.warning,
                border: `1px solid ${T.warning}30`,
                fontSize: "0.72rem",
                height: 24,
              }}
            />
          )}
        </Stack>
      </Box>
    </motion.div>
  );
};

// ─── Zone saisie note ─────────────────────────────────────────────────────────
// Échelle officielle WKF Kata Competition Rules, Art. 5.5.3 : 10 Parfait,
// 9-9.9 Excellent, 8-8.9 Très bien, 7-7.9 Bien, 6-6.9 Acceptable,
// 5-5.9 Insuffisant, 0 Disqualifié (rien d'autre n'est une note valide).
const libelleNote = (valeur) => {
  if (valeur === 0) return "Disqualifié";
  if (valeur >= 10) return "Parfait";
  if (valeur >= 9) return "Excellent";
  if (valeur >= 8) return "Très bien";
  if (valeur >= 7) return "Bien";
  if (valeur >= 6) return "Acceptable";
  return "Insuffisant";
};

const ZoneSaisie = ({ valeur, setValeur, onSoumettre, submitting, erreur }) => {
  const T = useCompetitionTheme();
  const disqualifie = valeur === 0;

  const getColor = () => {
    if (disqualifie) return T.danger;
    if (valeur >= 9) return T.success;
    if (valeur >= 7) return T.accent;
    return T.warning;
  };

  const noteColor = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: T.textMuted,
            fontSize: "0.7rem",
            letterSpacing: 2,
            textTransform: "uppercase",
            mb: 2,
          }}
        >
          Votre évaluation
        </Typography>

        {/* Note en grand avec glow */}
        <Box sx={{ textAlign: "center", mb: 2, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse, ${noteColor}20 0%, transparent 70%)`,
              pointerEvents: "none",
              borderRadius: 4,
            }}
          />
          <motion.div
            key={Math.round(valeur * 10)}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Typography
              sx={{
                fontSize: "5rem",
                fontWeight: 900,
                color: noteColor,
                lineHeight: 1,
                textShadow: `0 0 30px ${noteColor}60`,
              }}
            >
              {valeur.toFixed(1)}
            </Typography>
          </motion.div>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: T.textMuted,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {libelleNote(valeur)}
          </Typography>
        </Box>

        {disqualifie ? (
          <Stack alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
            <Typography sx={{ color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
              Cette prestation sera enregistrée comme disqualifiée (0).
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setValeur(7.0)}
              sx={{ borderColor: T.border, color: T.textMuted }}
            >
              Annuler la disqualification
            </Button>
          </Stack>
        ) : (
          <>
            {/* Slider — l'échelle valide va de 5.0 à 10.0 (Art. 5.4.1) */}
            <Box sx={{ px: 1, mb: 2.5 }}>
              <Slider
                value={valeur}
                onChange={(_, v) => setValeur(v)}
                min={5}
                max={10}
                step={0.1}
                sx={{
                  color: noteColor,
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20,
                    boxShadow: `0 0 8px ${noteColor}80`,
                  },
                  "& .MuiSlider-rail": { bgcolor: "action.hover", height: 5 },
                  "& .MuiSlider-track": { height: 5 },
                }}
              />
              <Stack direction="row" justifyContent="space-between">
                {["5", "6.25", "7.5", "8.75", "10"].map((v) => (
                  <Typography
                    key={v}
                    sx={{ fontSize: "0.6rem", color: T.textMuted }}
                  >
                    {v}
                  </Typography>
                ))}
              </Stack>
            </Box>

            {/* Boutons rapides */}
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.8}
              justifyContent="center"
              mb={1.5}
            >
              {[5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].map((v) => {
                const isSelected = Math.abs(valeur - v) < 0.05;
                return (
                  <motion.div key={v} whileTap={{ scale: 0.92 }}>
                    <Box
                      onClick={() => setValeur(v)}
                      sx={{
                        px: 1.5,
                        py: 0.6,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor: isSelected ? noteColor : "action.hover",
                        border: `1px solid ${isSelected ? noteColor : T.border}`,
                        color: isSelected ? "#000" : T.textMuted,
                        fontSize: "0.82rem",
                        fontWeight: isSelected ? 800 : 500,
                        transition: "all 0.15s",
                        boxShadow: isSelected ? `0 0 10px ${noteColor}50` : "none",
                        "&:hover": { borderColor: noteColor, color: noteColor },
                      }}
                    >
                      {v.toFixed(1)}
                    </Box>
                  </motion.div>
                );
              })}
            </Stack>

            <Stack alignItems="center" sx={{ mb: 2.5 }}>
              <Box
                onClick={() => setValeur(0)}
                sx={{
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  color: T.danger,
                  textDecoration: "underline",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                Disqualifier cette prestation
              </Box>
            </Stack>
          </>
        )}

        {erreur && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2, fontSize: "0.8rem" }}
          >
            {erreur}
          </Alert>
        )}

        {/* Bouton confirmer */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={submitting}
            onClick={onSoumettre}
            sx={{
              py: 1.8,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: "1rem",
              background: `linear-gradient(135deg, ${noteColor}, ${noteColor}cc)`,
              boxShadow: `0 4px 20px ${noteColor}40`,
              color: "#000",
              "&:hover": { boxShadow: `0 6px 24px ${noteColor}60` },
              "&.Mui-disabled": { bgcolor: "action.hover", color: T.textMuted },
            }}
          >
            {submitting ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={18} sx={{ color: "#000" }} />
                <span>Envoi...</span>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" gap={1}>
                <HowToVote sx={{ fontSize: 20 }} />
                <span>Confirmer — {valeur.toFixed(1)}</span>
              </Stack>
            )}
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

// ─── Note soumise ─────────────────────────────────────────────────────────────
const NoteConfirmee = ({ valeur }) => {
  const T = useCompetitionTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: "center",
          bgcolor: T.surface,
          border: `1px solid ${T.success}40`,
          boxShadow: `0 0 24px ${alpha(T.success, 0.12)}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${alpha(T.success, 0.08)} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 12,
            delay: 0.1,
          }}
        >
          <CheckCircle sx={{ fontSize: 64, color: T.success, mb: 1.5 }} />
        </motion.div>

        <Typography
          sx={{
            color: T.success,
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: 2.5,
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Note enregistrée
        </Typography>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Typography
            sx={{
              fontSize: "4rem",
              fontWeight: 900,
              color: T.success,
              lineHeight: 1,
              textShadow: `0 0 30px ${alpha(T.success, 0.4)}`,
              mb: 1,
            }}
          >
            {valeur.toFixed(1)}
          </Typography>
        </motion.div>

        <Typography sx={{ color: T.textMuted, fontSize: "0.85rem" }}>
          En attente du prochain athlète...
        </Typography>

        {/* Petites particules */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: T.success,
              left: `${20 + i * 20}%`,
              top: "20%",
            }}
            animate={{ y: [0, -20, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </Box>
    </motion.div>
  );
};

// ─── Aucune séance active ─────────────────────────────────────────────────────
const AucuneSeance = () => {
  const T = useCompetitionTheme();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <SportsMartialArts sx={{ fontSize: 64, color: T.textMuted, mb: 2 }} />
        </motion.div>
        <Typography
          sx={{
            color: T.text,
            fontWeight: 700,
            fontSize: "1.1rem",
            mb: 0.5,
          }}
        >
          Aucun athlète en cours
        </Typography>
        <Typography sx={{ color: T.textMuted, fontSize: "0.85rem" }}>
          En attente du lancement de la séance...
        </Typography>
        {/* Barre d'attente animée */}
        <Box
          sx={{
            mt: 3,
            height: 2,
            borderRadius: 99,
            bgcolor: "action.hover",
            overflow: "hidden",
            maxWidth: 200,
            mx: "auto",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              background: T.accent,
              borderRadius: 99,
              width: "40%",
            }}
            animate={{ x: ["-100%", "350%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </Box>
      </Box>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function KataArbitre({ config }) {
  const T = useCompetitionTheme();
  const [enCours, setEnCours] = useState(null);
  const [nextAthlete, setNextAthlete] = useState(null);
  const [notes, setNotes] = useState([]);
  const [valeur, setValeur] = useState(7.0);
  const [dejaNote, setDejaNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [erreur, setErreur] = useState(null);
  const enCoursRef = useRef(null);

  const fetchEnCours = useCallback(async () => {
    try {
      const [enCoursRes, nextAthleteRes] = await Promise.all([
        Instance.get(`/api/seances/competition/${config.id}/en-cours`),
        Instance.get(`/api/configs/${config.id}/next-athlete`),
      ]);

      const nextAthleteData = nextAthleteRes.data || null;
      setNextAthlete(nextAthleteData);

      const enCoursData = enCoursRes.data?.enCours || enCoursRes.data || null;

      // Reset si athlète change
      if (enCoursData?.id !== enCoursRef.current?.id) {
        setDejaNote(false);
        setSuccess(false);
        setValeur(7.0);
        setNotes([]);
      }
      enCoursRef.current = enCoursData;
      setEnCours(enCoursData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [config.id]);

  // Chargement initial
  useEffect(() => {
    if (!config) return;
    setLoading(true);
    fetchEnCours();
  }, [config.id]);

  // WebSocket
  useEffect(() => {
    if (!config) return;
    const channel = echo.channel(`tatami.${config.id}`);
    channel.listen(".tatami.updated", () => fetchEnCours());
    channel.listen(".note.ajoutee", (e) => {
      if (e.ordrePassageId === enCoursRef.current?.id) {
        setNotes((prev) => [...prev, e]);
      }
    });
    return () => echo.leaveChannel(`tatami.${config.id}`);
  }, [config.id, fetchEnCours]);

  const handleSoumettre = async () => {
    setSubmitting(true);
    setErreur(null);
    try {
      await Instance.post("/api/notes", {
        ordre_passage_id: enCours.id,
        valeur,
      });
      setDejaNote(true);
      setSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la saisie de la note:", err);
      setErreur(err.response?.data?.message || "Erreur lors de la saisie");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Rendu ──
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg, pb: 4 }}>
      {/* Barre top loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              zIndex: 9999,
              overflow: "hidden",
              background: T.border,
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
                width: "40%",
              }}
              animate={{ x: ["-100%", "350%"] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ maxWidth: 480, mx: "auto", px: 2, pt: 2 }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2.5}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 800, color: T.text, fontSize: "1rem" }}
            >
              {config?.plateau_nom ?? "Tatami"}
            </Typography>
            <Typography sx={{ color: T.textMuted, fontSize: "0.72rem" }}>
              {config?.discipline} · {config?.juges_option} juges ·{" "}
              {config?.niveau}
            </Typography>
          </Box>
          <Chip
            label={config?.discipline?.toUpperCase()}
            size="small"
            sx={{
              bgcolor:
                config?.discipline?.toLowerCase() === "kumite"
                  ? "#ef444420"
                  : "#00e5c020",
              color:
                config?.discipline?.toLowerCase() === "kumite"
                  ? "#ef4444"
                  : "#00e5c0",
              fontWeight: 700,
              fontSize: "0.65rem",
              border: "1px solid currentColor",
            }}
          />
        </Stack>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PageSkeleton />
            </motion.div>
          ) : !enCours ? (
            <motion.div key="empty">
              <AucuneSeance />
            </motion.div>
          ) : (
            <motion.div key="content">
              {/* Athlète en cours */}
              <AthleteEnCours
                enCours={enCours}
                notes={notes}
                nbJuges={config?.juges_option}
              />

              {/* Prochain athlète */}
              <ProchainAthlete nextAthlete={nextAthlete} compact />

              {/* Zone saisie ou confirmation */}
              <AnimatePresence mode="wait">
                {!dejaNote ? (
                  <motion.div key="saisie">
                    <ZoneSaisie
                      valeur={valeur}
                      setValeur={setValeur}
                      onSoumettre={handleSoumettre}
                      submitting={submitting}
                      erreur={erreur}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="confirmee">
                    <NoteConfirmee valeur={valeur} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
