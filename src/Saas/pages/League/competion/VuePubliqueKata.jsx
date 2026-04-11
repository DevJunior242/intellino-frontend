import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { Instance } from "../../../../Api/Axios";

export default function VuePubliqueKata() {
  const { configId } = useParams();
  console.log("configId", configId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    try {
      const res = await Instance.get(
        `/api/seances/configs/${configId}/vue-publique`,
      );
      console.log("res", res);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [configId]);
  console.log("data", data);
  // Polling toutes les 3s
  useEffect(() => {
    if (!configId) return;
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData, configId]);
  if (loading || !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  const enCours = data?.enCours;
  const notes = data?.notes || [];
  const score = data?.score;
  const classement = data?.classement || [];
  console.log("data", data);
  console.log("notes", notes);
  console.log("score", score);
  console.log("classement", classement);

  const nbJuges = data?.config?.juges_option || 5;
  const eliminer = nbJuges === 7 ? 2 : 1;

  // Identifier min et max à éliminer
  const getNotesAvecStatut = (notes = []) => {
    if (notes.length < nbJuges)
      return notes.map((n) => ({ ...n, elimine: false }));

    const sorted = [...notes].sort((a, b) => a.valeur - b.valeur);
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
  };
  const notesAvecStatut = getNotesAvecStatut(notes);

  const medailles = ["🥇", "🥈", "🥉"];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#1a1a2e",
        p: 3,
      }}
    >
      {/* Header compétition */}
      {enCours && (
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: "#4a3f8c",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="white">
            {enCours?.inscription?.competition?.evenement?.nom ?? "—"}-
            {enCours?.inscription?.competition?.evenement?.lieu ?? "—"}
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="white">
            {enCours?.inscription?.competition?.category?.nom ?? "—"}({" "}
            {enCours?.inscription?.competition?.category?.sexe ?? "—"})
          </Typography>
        </Paper>
      )}
      {/* Athlète en cours */}
      {enCours ? (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: "#7a5c00",
            textAlign: "center",
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
            bgcolor: "#2a2a4a",
            textAlign: "center",
          }}
        >
          <Typography color="rgba(255,255,255,0.5)">
            En attente du prochain athlète...
          </Typography>
        </Paper>
      )}

      {/* Notes des juges */}
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
            <Paper
              key={i}
              sx={{
                p: 2,
                minWidth: 110,
                flex: 1,
                maxWidth: 140,
                borderRadius: 3,
                textAlign: "center",
                bgcolor: elimine ? "#6b2c2c" : aNote ? "#1a5c3a" : "#2a2a4a",
                border: "1px solid",
                borderColor: elimine
                  ? "#993c1d"
                  : aNote
                    ? "#1d9e75"
                    : "transparent",
                transition: "all 0.3s",
              }}
            >
              <Typography variant="caption" color="rgba(255,255,255,0.6)">
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
                <Typography variant="h4" color="rgba(255,255,255,0.2)" mt={1}>
                  —
                </Typography>
              )}
            </Paper>
          );
        })}
      </Stack>

      {/* Score final */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: score ? "#4a3f8c" : "#2a2a4a",
          textAlign: "center",
          transition: "all 0.5s",
        }}
      >
        {score ? (
          <>
            <Typography variant="body2" color="rgba(255,255,255,0.6)" mb={1}>
              Score final (
              {notesAvecStatut
                .filter((n) => !n.elimine)
                .map((n) => n.valeur.toFixed(1))
                .join(" + ")}
              )
            </Typography>
            <Typography variant="h2" fontWeight="900" color="white">
              {score}
            </Typography>
          </>
        ) : (
          <Typography color="rgba(255,255,255,0.4)">
            Score final — en attente des notes
          </Typography>
        )}
      </Paper>

      {/* Classement provisoire */}
      {classement.length > 0 && (
        <>
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
              <Paper
                key={index}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  bgcolor: index === 0 ? "#7a5c00" : "#2a2a4a",
                  border: "1px solid",
                  borderColor: index === 0 ? "#f0a500" : "transparent",
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
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
