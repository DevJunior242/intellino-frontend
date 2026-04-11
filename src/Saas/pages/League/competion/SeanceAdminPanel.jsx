import { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import NotesProgress from "./NotesProgress";
import { ChildCareSharp } from "@mui/icons-material";

export default function SeanceAdminPanel({
  config,
  onAthleteSuivant,
  initSeance,
  handleLaunchSeance,
  error,
  success,
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enCours, setEnCours] = useState(null);
  // Toutes les notes reçues pour l'athlète en cours
  const toutesNotees = notes?.length === config?.juges_option;
  //encours
  const getEnCours = useCallback(async () => {
    try {
      const res = await Instance.get(
        `/api/seances/competition/${config.id}/en-cours`,
      );
      console.log("getEnCours res", res);
      setEnCours(res.data.enCours);
    } catch (err) {
      console.error(err);
    }
  }, [config]);

  useEffect(() => {
    if (!config) return;
    getEnCours();
    //polling pour rafraîchir enCours toutes les 5s
    const interval = setInterval(getEnCours, 5000);
    return () => clearInterval(interval);
  }, [getEnCours, config]);

  const handleSuivant = async () => {
    setLoading(true);
    const { data } = await Instance.post(
      `/api/seances/configs/${config.id}/athlete-suivant`,
    );
    initSeance();
    setNotes([]); // reset notes
    onAthleteSuivant(data.enCours);
    setLoading(false);
  };

  return (
    <Box>
      {/* Athlète en cours */}
      {enCours && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "primary.light",
            bgcolor: "primary.50",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {enCours?.inscription?.athlete?.fullname ?? "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Passage N°{enCours?.ordre ?? "—"} · Catégorie :{" "}
                {enCours?.inscription?.competition?.category?.nom ?? "—"}({" "}
                {enCours?.inscription?.competition?.category?.sexe ?? "—"})
              </Typography>
            </Box>
            <Chip
              label={`${notes.length}/${config?.juges_option} notes`}
              color={
                notes.length === config?.juges_option ? "success" : "warning"
              }
            />
          </Stack>
        </Paper>
      )}
      {/* Erreurs / succès */}
      {success[config.id] && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {success[config.id]}
        </Alert>
      )}
      {error[config.id]?.length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error?.[config.id] &&
            (Array.isArray(error[config.id]) ? (
              error[config.id].map((err, index) => <p key={index}>{err}</p>)
            ) : (
              <p>{error[config.id]}</p>
            ))}
        </Alert>
      )}

      {/* Suivi des notes */}
      <NotesProgress
        ordrePassageId={enCours?.id ?? null}
        nbJuges={config.juges_option}
        onNotesChange={setNotes}
      />

      <Button
        fullWidth
        variant="contained"
        disabled={loading || (enCours && !toutesNotees)}
        onClick={() => {
          if (!enCours) {
            handleLaunchSeance(config?.id);
          } else if (enCours && toutesNotees) {
            handleSuivant();
          }
        }}
        sx={{ mt: 2 }}
      >
        {!enCours
          ? "Lancer la séance"
          : toutesNotees
            ? "Athlète suivant →"
            : `En attente des notes (${notes.length}/${config.juges_option})`}
      </Button>
    </Box>
  );
}
