import React, { useState } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Instance } from "../../Api/Axios";

export default function AdminKeyGenerator() {
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState("league");
  const [comment, setComment] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");

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
    <Paper sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Générateur de Clés SaaS
      </Typography>

      <Stack spacing={3}>
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
    </Paper>
  );
}
