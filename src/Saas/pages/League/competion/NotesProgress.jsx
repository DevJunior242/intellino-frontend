import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, HourglassEmpty } from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";

export default function NotesProgress({
  ordrePassageId,
  nbJuges,
  onNotesChange,
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);

  const fetchNotes = useCallback(async () => {
    if (!ordrePassageId) return;
    setLoading(true);
    try {
      const res = await Instance.get(
        `/api/inscriptions/${ordrePassageId}/notes`,
      );
      console.log("notes data", res);
      const notesData = res?.data?.data || [];
      setNotes(notesData);
      onNotesChange(notesData); // remonter au parent
      setScore(res?.data?.score ?? null); // score calculé côté backend
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ordrePassageId, onNotesChange]);

  // Polling toutes les 2s — remplacé par WebSocket plus tard
  useEffect(() => {
    fetchNotes();
    // const interval = setInterval(fetchNotes, 5000);
    // return () => clearInterval(interval);
  }, [ordrePassageId, fetchNotes]);

  const progression = (notes.length / nbJuges) * 100;
  const toutesRecues = notes.length === nbJuges;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography fontWeight="bold">Notes reçues</Typography>
        <Chip
          label={`${notes.length} / ${nbJuges}`}
          color={toutesRecues ? "success" : "default"}
          size="small"
        />
      </Stack>

      {/* Barre de progression */}
      <LinearProgress
        variant="determinate"
        value={progression}
        color={toutesRecues ? "success" : "primary"}
        sx={{ borderRadius: 2, height: 8, mb: 3 }}
      />

      {/* Liste des postes */}
      <Stack spacing={1}>
        {Array.from({ length: nbJuges }, (_, i) => {
          const note = notes[i];
          return (
            <Stack
              key={i}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: note ? "success.50" : "grey.50",
                border: "1px solid",
                borderColor: note ? "success.light" : "grey.200",
              }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                {note ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <HourglassEmpty color="warning" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Juge {i + 1}
                  {note && ` — ${note.arbitre}`}
                </Typography>
              </Stack>

              {note ? (
                <Typography fontWeight="bold" color="success.main">
                  {note.valeur}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  en attente...
                </Typography>
              )}
            </Stack>
          );
        })}
      </Stack>

      {/* Score final si toutes reçues */}
      {toutesRecues && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "success.main",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography color="white" variant="body2">
            Score final (min/max éliminés)
          </Typography>
          <Typography color="white" variant="h4" fontWeight="900">
            {score}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
