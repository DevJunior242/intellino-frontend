import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyIcon from "@mui/icons-material/Key";
import { Instance } from "../../Api/Axios";
import Message from "./Message";

export default function TakeoverKeyGenerator() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [comment, setComment] = useState("");
  const [generatedKeyData, setGeneratedKeyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await Instance.get("/api/leagues/getLeaguesForAdmin");
        if (response.data?.success) {
          setLeagues(response.data.leagues);
        }
      } catch (err) {
        setError("Impossible de charger la liste des ligues.");
      }
    };
    fetchLeagues();
  }, []);

  // 2. Soumission pour générer la clé de type "takeover_league"
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setGeneratedKeyData(null);

    try {
      const dataSend = {
        type: "takeover_league", // Type spécifique pour la reprise forcée
        target_league_id: selectedLeagueId,
        comment:
          comment || `Clé de passation pour la ligue ID : ${selectedLeagueId}`,
      };
      const response = await Instance.post("/api/activation-keys", dataSend);

      if (response.data?.success) {
        setGeneratedKeyData(response.data.data); // Stocke la clé renvoyée par Laravel
        setSuccess("Clé de reprise générée avec succès !");
      }
    } catch (err) {
      setError("Erreur lors de la génération de la clé.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Fonction pour copier le lien final avec l'ID dans le presse-papier
  const handleCopyLink = async (keyCode) => {
    const fullLink = `${window.location.origin}/activation/takeover/${selectedLeagueId}`;

    const textToCopy = `🔑 Clé : ${keyCode}\n🔗 Lien : ${fullLink}`;
    if (!navigator.clipboard) {
      alert(
        "La copie automatique n'est pas disponible sur cette version du site. Elle sera disponible lorsque le site utilisera HTTPS.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      alert("Clé et lien copiés dans le presse-papier !");
    } catch (error) {
      alert(
        "Impossible de copier automatiquement. Vérifiez que vous utilisez HTTPS ou copiez le texte manuellement.",
      );
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: "md",
        mx: "auto",
        mt: 4,
        borderRadius: 2,
        boxShadow: 6,
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <KeyIcon color="error" />
        <Typography variant="h5" fontWeight="bold">
          Panel Admin : Générateur de Clé de Reprise (Takeover)
        </Typography>
      </Box>

      {success && <Message text={success} type="success" />}
      {error && <Message text={error} type="error" />}

      <form onSubmit={handleGenerateKey}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Menu déroulant contenant toutes les ligues de ta DB */}
          <FormControl fullWidth required>
            <InputLabel>Sélectionner la ligue à reprendre</InputLabel>
            <Select
              value={selectedLeagueId}
              label="Sélectionner la ligue à reprendre"
              onChange={(e) => setSelectedLeagueId(e.target.value)}
            >
              {leagues.map((league) => (
                <MenuItem key={league.id} value={league.id}>
                  {league.name} (ID: {league.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Note / Commentaire (ex: Nom du nouveau président)"
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ex: Mandat de l'ancien bureau expiré, génération pour M. Traoré"
          />

          <Button
            type="submit"
            variant="contained"
            color="error"
            fullWidth
            disabled={loading || !selectedLeagueId}
            sx={{ p: 1.5, fontWeight: "bold", textTransform: "none" }}
          >
            {loading ? "Génération..." : "Créer la clé de sécurité"}
          </Button>
        </Box>
      </form>

      {/* ── ZONE DE RÉSULTAT : S'affiche dès que l'API Laravel répond ── */}
      {generatedKeyData && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: "action.hover",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "error.main",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="error.main"
            mb={2}
          >
            🎯 Données prêtes à l'envoi :
          </Typography>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2">
              <strong>Clé générée :</strong>{" "}
              <code>{generatedKeyData.key_code}</code>
            </Typography>
            <Typography variant="body2">
              <strong>Lien sécurisé :</strong>
              <code>{`${window.location.origin}/activation/takeover/${selectedLeagueId}`}</code>
            </Typography>
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ContentCopyIcon />}
              onClick={() => handleCopyLink(generatedKeyData.key_code)}
              sx={{ textTransform: "none" }}
            >
              Copier le pack (Clé + Lien ID)
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
