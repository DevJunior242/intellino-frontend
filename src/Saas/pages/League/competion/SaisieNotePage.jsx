import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
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
} from "@mui/material";
import { CheckCircle, SportsMartialArts } from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";

export default function SaisieNotePage({ config }) {
  const [enCours, setEnCours] = useState(null);
  const [valeur, setValeur] = useState(7.0);
  const [dejaNote, setDejaNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [erreur, setErreur] = useState(null);
  const enCoursRef = useRef(null);
  console.log("config dans saisienotepage", config);

  // Récupérer l'athlète en cours
  const fetchEnCours = useCallback(async () => {
    try {
      const res = await Instance.get(
        `/api/seances/competition/${config.id}/en-cours`,
      );
      console.log("examen en cours data", res);
      // Reset si nouvel athlète
      const newEnCours = res.data.enCours;

      if (newEnCours?.id !== enCoursRef.current?.id) {
        setDejaNote(false);
        setSuccess(false);
        setValeur(7.0);
      }
      enCoursRef.current = newEnCours;
      setEnCours(newEnCours);
    } catch (err) {
      console.error(err);
    }
  }, [config]);

  // Polling toutes les 2s
  useEffect(() => {
    if (!config) return;
    fetchEnCours();
    const interval = setInterval(fetchEnCours, 2000);
    return () => clearInterval(interval);
  }, [fetchEnCours, config]);

  const handleSoumettre = async () => {
    setLoading(true);
    setErreur(null);
    try {
      const res = await Instance.post("/api/notes", {
        ordre_passage_id: enCours.id,
        valeur: valeur,
      });
      console.log("note submission response", res);
      setDejaNote(true);
      setSuccess(true);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de la saisie");
    } finally {
      setLoading(false);
    }
  };

  // Pas d'athlète en cours
  if (!enCours) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          En attente du prochain athlète...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 500, mx: "auto" }}>
      {/* Athlète en cours */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 2, textAlign: "center" }}>
        <SportsMartialArts
          sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
        />
        <Typography variant="h5" fontWeight="900">
          {enCours?.inscription?.athlete?.fullname ?? "—"}
        </Typography>
        <Stack direction="row" justifyContent="center" gap={1} mt={1}>
          <Chip
            label={`Passage N° ${enCours?.ordre ?? "—"}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={enCours?.inscription?.competition?.category?.nom ?? "—"}
            size="small"
            variant="outlined"
          />
        </Stack>
      </Paper>

      {/* Zone saisie note */}
      {!dejaNote ? (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" textAlign="center" mb={3}>
            Votre note
          </Typography>

          {/* Note affichée en grand */}
          <Typography
            variant="h1"
            fontWeight="900"
            textAlign="center"
            color="primary.main"
            mb={2}
          >
            {valeur.toFixed(1)}
          </Typography>

          {/* Slider */}
          <Slider
            value={valeur}
            onChange={(_, v) => setValeur(v)}
            min={0}
            max={10}
            step={0.1}
            marks={[
              { value: 0, label: "0" },
              { value: 5, label: "5" },
              { value: 10, label: "10" },
            ]}
            sx={{ mb: 3 }}
          />

          {/* Boutons rapides */}
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            justifyContent="center"
            mb={3}
          >
            {[5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
              <Chip
                key={v}
                label={v.toFixed(1)}
                onClick={() => setValeur(v)}
                color={valeur === v ? "primary" : "default"}
                variant={valeur === v ? "filled" : "outlined"}
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              />
            ))}
          </Stack>

          {erreur && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreur}
            </Alert>
          )}

          {/* Bouton soumettre */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleSoumettre}
            sx={{ py: 2, borderRadius: 3, fontWeight: "bold" }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Confirmer — ${valeur.toFixed(1)}`
            )}
          </Button>
        </Paper>
      ) : (
        // Note soumise — attente prochain athlète
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            bgcolor: "success.50",
            border: "1px solid",
            borderColor: "success.light",
          }}
        >
          <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h3" fontWeight="900" color="success.main">
            {valeur.toFixed(1)}
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Note enregistrée — en attente du prochain athlète
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
