import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Star, StarBorder, Person, CheckCircle } from "@mui/icons-material";

export default function DesignerSuperviseur({
  config,
  onSuperviseurDesigne,
  handleLaunchSeance,
}) {
  const [arbitres, setArbitres] = useState([]);
  const [superviseur, setSuperviseur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  // Charger les arbitres de la rotation
  const fetchArbitres = async () => {
    try {
      const { data } = await axios.get(
        `/api/configs/${config.id}/arbitres-rotation`,
      );
      setArbitres(data.arbitres);
      setSuperviseur(data.superviseur);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArbitres();
  }, [config.id]);

  const handleDesigner = async (arbitreCompetitionId) => {
    setSubmitId(arbitreCompetitionId);
    setErreur(null);
    setSucces(null);
    try {
      await axios.patch(`/api/configs/${config.id}/superviseur`, {
        arbitre_competition_id: arbitreCompetitionId,
      });
      await fetchArbitres(); // refresh
      setSucces("Superviseur désigné !");
      setTimeout(() => {
        onSuperviseurDesigne?.(); // callback parent
      }, 1500);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de la désignation");
    } finally {
      setSubmitId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: "primary.50" }}>
        <Typography variant="h6" fontWeight="bold">
          {config.nom}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Désignez le superviseur de ce tatami
        </Typography>
      </Paper>

      {/* Alertes */}
      {succes && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {succes}
        </Alert>
      )}
      {erreur && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {erreur}
        </Alert>
      )}

      {/* Superviseur actuel */}
      {superviseur && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "2px solid",
            borderColor: "warning.main",
            bgcolor: "warning.50",
          }}
        >
          <Stack direction="row" alignItems="center" gap={2}>
            <Star color="warning" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Superviseur actuel
              </Typography>
              <Typography fontWeight="bold">{superviseur.nom}</Typography>
            </Box>
            <Chip
              label={superviseur.actif ? "En poste" : "Au banc"}
              size="small"
              color={superviseur.actif ? "success" : "default"}
              sx={{ ml: "auto" }}
            />
          </Stack>
        </Paper>
      )}

      <Divider sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Arbitres disponibles
        </Typography>
      </Divider>

      {/* Liste arbitres */}
      <Stack spacing={1}>
        {arbitres.map((arbitre) => {
          const estSuperviseur = arbitre.est_superviseur;
          const enCharge = submitId === arbitre.arbitre_competition_id;

          return (
            <Paper
              key={arbitre.id}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: estSuperviseur ? "warning.main" : "divider",
                bgcolor: estSuperviseur ? "warning.50" : "background.paper",
              }}
            >
              <Stack direction="row" alignItems="center" gap={2}>
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor: estSuperviseur ? "warning.main" : "grey.200",
                    width: 36,
                    height: 36,
                  }}
                >
                  {estSuperviseur ? (
                    <Star fontSize="small" />
                  ) : (
                    <Person fontSize="small" />
                  )}
                </Avatar>

                {/* Infos */}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight="bold">{arbitre.nom}</Typography>
                  <Stack direction="row" gap={1} mt={0.5}>
                    <Chip
                      label={arbitre.actif ? `Poste ${arbitre.poste}` : "Banc"}
                      size="small"
                      color={arbitre.actif ? "primary" : "default"}
                      variant="outlined"
                    />
                    <Chip
                      label={`${arbitre.nb_passages} passages`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                {/* Bouton désigner */}
                {estSuperviseur ? (
                  <CheckCircle color="warning" />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={
                      enCharge ? <CircularProgress size={14} /> : <StarBorder />
                    }
                    disabled={submitId !== null}
                    onClick={() =>
                      handleDesigner(arbitre.arbitre_competition_id)
                    }
                    sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
                  >
                    {enCharge ? "..." : "Désigner"}
                  </Button>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* Bouton lancer si superviseur désigné */}
      {superviseur && (
        <Button
          fullWidth
          variant="contained"
          color="success"
          disabled={!superviseur}
          sx={{ mt: 3, py: 2, borderRadius: 3, fontWeight: "bold" }}
          onClick={handleLaunchSeance}
        >
          lancer la séance
        </Button>
      )}
    </Box>
  );
}
