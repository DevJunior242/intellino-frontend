import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Stack,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";
import ErrorBlock from "./ErrorBlock";

const TYPE_LABELS = {
  league: "Ligue",
  club: "Club",
  federation: "Fédération",
  takeover_league: "Reprise de ligue",
  takeover_fede: "Reprise de fédération",
};

export default function AdminKeyGenerator() {
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState("league");
  const [comment, setComment] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");

  const [keys, setKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [keysError, setKeysError] = useState("");

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    setKeysError("");
    try {
      const response = await Instance.get("/api/activation-keys");
      setKeys(response.data.data || []);
    } catch {
      setKeysError("Impossible de charger les clés générées.");
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleGenerate = async () => {
    setSubmitting(true);
    try {
      const response = await Instance.post("/api/activation-keys", {
        type,
        comment,
      });
      if (response.data.success) {
        setGeneratedKey(response.data.data.key_code);
        setComment("");
        fetchKeys();
      }
    } catch (error) {
      console.error("Erreur de génération", error);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    alert("Clé copiée dans le presse-papier !");
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Générateur de Clés SaaS
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 500, mx: "auto" }}>
        <TextField
          select
          label="Type de structure"
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
        >
          <MenuItem value="federation">Fédération</MenuItem>
          <MenuItem value="league">Ligue</MenuItem>
          <MenuItem value="club">Club local</MenuItem>
        </TextField>

        <TextField
          label="Note / Nom du client"
          placeholder="Ex: Ligue de Bobo-Dioulasso"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          rows={3}
          maxRows={3}
        />

        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleGenerate}
          disabled={submitting}
        >
          {submitting ? "chargement......" : "  Générer la clé d'activation"}
        </Button>

        {generatedKey && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bg: "#f5f5f5",
              borderRadius: 2,
              border: "1px dashed #d32f2f",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Clé à envoyer au client :
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="secondary"
              sx={{ letterSpacing: 1, my: 1 }}
            >
              {generatedKey}
            </Typography>
            <Button
              startIcon={<ContentCopyIcon />}
              size="small"
              onClick={copyToClipboard}
            >
              Copier la clé
            </Button>
          </Box>
        )}
      </Stack>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Clés gérées
        </Typography>

        {loadingKeys ? (
          <ConfigSkeleton />
        ) : keysError ? (
          <ErrorBlock message={keysError} onRetry={fetchKeys} />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Clé</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Organisation</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keys.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune clé générée pour le moment.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {keys.map((key) => (
                  <TableRow key={key.id} hover>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      {key.key_code}
                    </TableCell>
                    <TableCell>{TYPE_LABELS[key.type] || key.type}</TableCell>
                    <TableCell>{key.organisation_name || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={key.is_used ? "Utilisée" : "Disponible"}
                        size="small"
                        color={key.is_used ? "default" : "success"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{key.comment || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
}
