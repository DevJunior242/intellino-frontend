import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import {
  Update,
  EventNote,
  DeleteForeverOutlined,
  DeleteOutline,
  Delete,
} from "@mui/icons-material";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../ErrorGlobal";
import Message from "../../Saas/pages/Message";

function ConfirmDeleteAccount({ open, onClose }) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //delete user
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await Instance.delete("/api/setting/account");
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => setSuccess(""), 4000);
      }
      setError(res.data.errors);
    } catch (error) {
      // Gérer les erreurs (ex: afficher les messages d'erreur de validation)
      ErrorGlobal({ error, setError });
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default" }}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "background.default",
          }}
        >
          <DeleteForeverOutlined color="error" />
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              color: "error.main",
            }}
          >
            Supprimer mon compte
          </Typography>
        </DialogTitle>
        <Box sx={{ display: "flex", gap: 2, m: 3 }}>
          {success && <Message text={success} type="success" />}
          {error?.general && <Message text={error.general} type="error" />}
        </Box>
        <form onSubmit={handleDeleteAccount}>
          <DialogContent
            dividers
            sx={{ backgroundColor: "background.default" }}
          >
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est
              irréversible et entraînera la perte de toutes vos données.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} color="error">
              Annuler
            </Button>
            <Button
              disabled={loading}
              onClick={handleDeleteAccount}
              
              color="error"
              type="submit"
              variant="contained"
              startIcon={<Delete />}
              sx={{
                mt: 2,
                textTransform: "none",
                fontSize: { xs: 14, md: 24 },
              }}
            >
              {loading ? "Suppression..." : "Confirmer"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default ConfirmDeleteAccount;
