import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Pour récupérer l'ID dans l'URL
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import GavelIcon from "@mui/icons-material/Gavel";
import { UseAuth } from "../../../../Api/AuthContext";
import { Instance } from "../../../../Api/Axios";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import Message from "../../Message";

export default function TakeoverLeagueForm() {
  const { leagueId } = useParams(); // Récupère le leagueId depuis l'URL (ex: /activation/takeover/5)
  const { switchPortal, updateAuth } = UseAuth();

  const [leagueName, setLeagueName] = useState(""); // Pour afficher le nom de la ligue visée
  const [formData, setFormData] = useState({
    activation_key: "",
    mandate_end_at: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");

  // OPTIONNEL MAIS TOP POUR L'UX : Récupérer le nom de la ligue au chargement pour confirmer à l'utilisateur
  useEffect(() => {
    const fetchLeagueDetails = async () => {
      try {
        // Crée une route publique ou semi-publique juste pour afficher le nom
        const response = await Instance.get(
          `/api/leagues/public-info/${leagueId}`,
        );
        setLeagueName(response.data.name);
      } catch (err) {
        console.log("Impossible de charger les détails de la ligue", err);
      }
    };
    if (leagueId) fetchLeagueDetails();
  }, [leagueId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);

    // On combine les données du formulaire ET le leagueId de l'URL
    const payload = {
      ...formData,
      league_id: leagueId,
    };

    try {
      const response = await Instance.post("/api/leagues/takeover", payload);
      if (response?.data?.success) {
        const { user, leagues, clubs, roles, new_league } = response.data;
        setSuccess(response.data.message);

        updateAuth({
          user: user,
          leagues: leagues,
          clubs: clubs,
          role: roles,
        });

        switchPortal(new_league.id, new_league.type, new_league.role);
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{
          p: 5,
          mt: 4,
          borderRadius: 3,
          boxShadow: 6,
          backgroundColor: "background.default",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <GavelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Reprise de la structure
          </Typography>
          {leagueName && (
            <Typography
              variant="h6"
              color="primary"
              fontWeight="bold"
              sx={{ mt: 1, textAlign: "center" }}
            >
              🏢 {leagueName}
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1 }}
          >
            Procédure sécurisée de passation de pouvoir pour les nouveaux
            bureaux élus.
          </Typography>
        </Box>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Clé de passation prioritaire (Takeover Key)"
              name="activation_key"
              required
              fullWidth
              placeholder="Ex: TAKEOVER-2026-XXXX-XXXX"
              value={formData.activation_key}
              onChange={handleChange}
              autoFocus
            />

            <TextField
              label="Date d'échéance de votre nouveau mandat"
              name="mandate_end_at"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.mandate_end_at}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              disabled={submitting}
              sx={{ p: 2, textTransform: "none", fontWeight: "bold" }}
            >
              {submitting
                ? "Vérification et révocation de l'ancien bureau..."
                : "Prendre le contrôle de la Ligue"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
