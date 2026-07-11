import { useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import { Instance } from "../Api/Axios";

function EmailVerificationBanner({ onClose }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await Instance.post("/api/email/verification-notification");
      setSent(true);
    } catch {
      // Silencieux : l'utilisateur peut réessayer, pas d'action bloquante ici
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.modal + 10,
        bgcolor: "warning.dark",
        color: "#fff",
        px: 2,
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        flexWrap: "wrap",
      }}
    >
      <WarningAmberIcon fontSize="small" />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Merci de confirmer ton adresse email pour accéder à cette action.
      </Typography>

      {sent ? (
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Email renvoyé, vérifie ta boîte de réception.
        </Typography>
      ) : (
        <Button
          size="small"
          variant="outlined"
          onClick={handleResend}
          disabled={sending}
          sx={{
            color: "#fff",
            borderColor: "rgba(255,255,255,0.6)",
            "&:hover": { borderColor: "#fff" },
          }}
        >
          {sending ? "Envoi..." : "Renvoyer l'email"}
        </Button>
      )}

      <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default EmailVerificationBanner;
