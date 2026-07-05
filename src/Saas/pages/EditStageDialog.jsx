import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Typography,
  Alert,
  Box,
  Snackbar,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import axios from "axios";
import { Instance } from "../../Api/Axios";

const ACCENT = "#3949AB";
const INK = "#F1F2F4";

const TYPE_OPTIONS = [
  { value: "technique", label: "Technique" },
  { value: "arbitrage", label: "Arbitrage" },
  { value: "perfectionnement", label: "Perfectionnement" },
];

const EMPTY_FORM = {
  title: "",
  type: "",
  start_at: "",
  end_at: "",
};

// Normalise une date ISO ("2026-06-20T00:00:00.000Z" ou "2026-06-20")
// vers le format attendu par <input type="date"> : "YYYY-MM-DD"
function toDateInputValue(value) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function EditStageDialog({
  open,
  stage,
  onClose,
  onRefresh,
  setToast,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Pré-remplit le formulaire dès qu'un stage est passé en prop
  useEffect(() => {
    if (stage) {
      setForm({
        title: stage.title || "",
        type: stage.type || "",
        start_at: toDateInputValue(stage.start_at),
        end_at: toDateInputValue(stage.end_at),
      });
      setErrors({});
      setServerError(null);
    }
  }, [stage]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Le titre est requis.";
    if (!form.type) next.type = "Le type est requis.";
    if (!form.start_at) next.start_at = "La date de début est requise.";
    if (form.end_at && form.start_at && form.end_at < form.start_at) {
      next.end_at = "La date de fin doit être après la date de début.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !stage) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await Instance.put(`/api/stages/${stage.id}`, {
        title: form.title,
        type: form.type,
        start_at: form.start_at,
        end_at: form.end_at || null,
      });
      setToast({
        open: true,
        message: "Stage modifié avec succès !",
        severity: "success",
      });

      onRefresh();
      onClose();
    } catch (err) {
      if (err.response?.status === 422) {
        // Erreurs de validation Laravel : { errors: { title: [...], ... } }
        const apiErrors = err.response.data.errors || {};
        const mapped = {};
        Object.keys(apiErrors).forEach((key) => {
          mapped[key] = apiErrors[key][0];
        });
        setErrors(mapped);
      } else {
        setServerError(
          err.response?.data?.message ||
            "Une erreur est survenue lors de la mise à jour.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return; // empêche de fermer pendant l'envoi
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 800,
          color: INK,
        }}
      >
        Modifier le stage
        <IconButton size="small" onClick={handleClose} disabled={submitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {serverError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {serverError}
            </Alert>
          )}

          <TextField
            label="Titre du stage"
            fullWidth
            value={form.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title}
            disabled={submitting}
          />

          <FormControl fullWidth error={!!errors.type} disabled={submitting}>
            <InputLabel>Type</InputLabel>
            <Select
              value={form.type}
              label="Type"
              onChange={handleChange("type")}
            >
              {TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Date de début"
              type="date"
              fullWidth
              value={form.start_at}
              onChange={handleChange("start_at")}
              error={!!errors.start_at}
              helperText={errors.start_at}
              disabled={submitting}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Date de fin"
              type="date"
              fullWidth
              value={form.end_at}
              onChange={handleChange("end_at")}
              error={!!errors.end_at}
              helperText={errors.end_at || "Optionnel"}
              disabled={submitting}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {stage?.level && (
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: "#F3F4F6",
              }}
            >
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                Niveau : <strong>{stage.level}</strong> — non modifiable, dépend
                de votre organisme.
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={submitting}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          sx={{
            bgcolor: ACCENT,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#303F9F", boxShadow: "none" },
          }}
        >
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
