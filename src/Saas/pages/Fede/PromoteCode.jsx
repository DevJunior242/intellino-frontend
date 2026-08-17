import React, { useState } from "react";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { UseAuth } from "../../../Api/AuthContext";

function PromoteCode() {
  const { activeId, invitationCode } = UseAuth();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      alert(
        "La copie automatique n'est pas disponible sur cette version du site. Elle sera disponible lorsque le site utilisera HTTPS.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Impossible de copier le code. Veuillez réessayer.");
    }
  };
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
          borderBottom: "1px solid #e0e0e0",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Gérez vos ligues, vos compétitions et vos arbitres nationaux.
          </Typography>
        </Box>

        {/* LE BADGE DE COPIE SECURISÉ */}
        <Box display="flex" gap={1}>
          <TextField
            label="Code d'invitation"
            value={invitationCode}
            InputProps={{
              readOnly: true,
            }}
            size="small"
          />

          <Button
            onClick={handleCopy}
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          >
            {copied ? "Copié" : "Copier"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default PromoteCode;
