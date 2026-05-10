import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  CircularProgress,
  Fade,
} from "@mui/material";
import { CheckCircle, HourglassEmpty } from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";
import echo from "../../../../echo";

export default function NotesProgress({
  ordrePassageId,
  nbJuges,
  onNotesChange,
  configId,
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);

  const fetchNotes = useCallback(async () => {
    if (!ordrePassageId) return;
    // Pas de setLoading(true) ici pour éviter le clignotement au polling
    try {
      const res = await Instance.get(
        `/api/inscriptions/${ordrePassageId}/notes`,
      );
      const notesData = res?.data?.data || [];
      setNotes(notesData);
      onNotesChange(notesData);
      setScore(res?.data?.score ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ordrePassageId, onNotesChange]);

  useEffect(() => {
    setLoading(true);
    setNotes([]);
    setScore(null);
    fetchNotes();
  }, [ordrePassageId]);

  // useEffect(() => {
  //   if (!ordrePassageId) return;
  //   const interval = setInterval(fetchNotes, 3000);
  //   return () => clearInterval(interval);
  // }, [ordrePassageId, fetchNotes]);
  useEffect(() => {
    if (!ordrePassageId || !configId) return;

    const channel = echo.channel(`tatami.${configId}`);

    channel.listen(".note.ajoutee", (e) => {
      if (e.ordrePassageId === ordrePassageId) {
        fetchNotes();
      }
    });

    return () => {
      echo.leaveChannel(`tatami.${configId}`);
    };
  }, [ordrePassageId, configId]);
  const progression = nbJuges > 0 ? (notes.length / nbJuges) * 100 : 0;
  const toutesRecues = notes.length === nbJuges && nbJuges > 0;

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: "#141720",
          border: "1px solid #1e2433",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
          <CircularProgress size={16} sx={{ color: "#6c63ff" }} />
          <Typography variant="body2" sx={{ color: "#636b88" }}>
            Chargement des notes...
          </Typography>
        </Stack>
        {Array.from({ length: nbJuges }, (_, i) => (
          <Box
            key={i}
            sx={{
              height: 52,
              borderRadius: 2,
              bgcolor: "#1e2433",
              mb: 1,
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: "#141720",
        border: "1px solid #1e2433",
      }}
    >
      {/* Header avec progression */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            fontWeight="bold"
            sx={{ color: "#dde1f0", fontSize: "0.9rem" }}
          >
            Notes reçues
          </Typography>
          {/* Indicateur de polling live */}
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#22c55e",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%,100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.4, transform: "scale(0.8)" },
              },
            }}
          />
        </Stack>
        <Chip
          label={`${notes.length} / ${nbJuges}`}
          color={
            toutesRecues ? "success" : notes.length > 0 ? "warning" : "default"
          }
          size="small"
          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
        />
      </Stack>

      {/* Barre progression */}
      <Box sx={{ mb: 2.5 }}>
        <LinearProgress
          variant="determinate"
          value={progression}
          color={toutesRecues ? "success" : "primary"}
          sx={{ borderRadius: 2, height: 6, bgcolor: "#1e2433" }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "#636b88",
            mt: 0.5,
            display: "block",
            fontSize: "0.65rem",
          }}
        >
          {toutesRecues
            ? "Toutes les notes reçues"
            : `${nbJuges - notes.length} note${nbJuges - notes.length > 1 ? "s" : ""} en attente`}
        </Typography>
      </Box>

      {/* Liste des postes */}
      <Stack spacing={0.75}>
        {Array.from({ length: nbJuges }, (_, i) => {
          const note = notes[i];
          return (
            <Fade in key={i} timeout={300}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: { xs: 1.2, sm: 1.5 },
                  borderRadius: 2,
                  bgcolor: note ? "rgba(34,197,94,0.06)" : "#1a1e2a",
                  border: "1px solid",
                  borderColor: note ? "rgba(34,197,94,0.2)" : "#1e2433",
                  transition: "all 0.4s ease",
                }}
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  {note ? (
                    <CheckCircle sx={{ color: "#22c55e", fontSize: 16 }} />
                  ) : (
                    <HourglassEmpty
                      sx={{
                        color: "#636b88",
                        fontSize: 16,
                        animation: "spin 3s linear infinite",
                        "@keyframes spin": {
                          from: { transform: "rotate(0deg)" },
                          to: { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                  )}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: note ? "#dde1f0" : "#636b88",
                        fontWeight: 500,
                        fontSize: { xs: "0.75rem", sm: "0.82rem" },
                        lineHeight: 1.2,
                      }}
                    >
                      Juge {i + 1}
                    </Typography>
                    {note && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#636b88", fontSize: "0.65rem" }}
                      >
                        {note.arbitre}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {note ? (
                  <Typography
                    fontWeight="bold"
                    sx={{
                      color: "#22c55e",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                    }}
                  >
                    {note.valeur}
                  </Typography>
                ) : (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <CircularProgress size={10} sx={{ color: "#636b88" }} />
                    <Typography
                      variant="caption"
                      sx={{ color: "#636b88", fontSize: "0.65rem" }}
                    >
                      attente
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Fade>
          );
        })}
      </Stack>

      {/* Score final */}
      {toutesRecues && (
        <Fade in timeout={500}>
          <Box
            sx={{
              mt: 2.5,
              p: { xs: 2, sm: 2.5 },
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.75rem",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Score final (min/max éliminés)
            </Typography>
            <Typography
              sx={{
                color: "white",
                fontSize: { xs: "2rem", sm: "2.5rem" },
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {score}
            </Typography>
          </Box>
        </Fade>
      )}
    </Paper>
  );
}
