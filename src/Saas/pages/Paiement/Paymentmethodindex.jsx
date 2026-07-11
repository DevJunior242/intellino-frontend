import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AccountBalanceWalletOutlined as AccountBalanceWalletOutlinedIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { alpha, useTheme } from "@mui/material/styles";
import { Instance } from "../../../Api/Axios";

// Palette dérivée du thème actif (au lieu de valeurs fixes) pour s'adapter
// au clair/sombre des dashboards ligue/fédération.
const useLocalTheme = () => {
  const t = useTheme();
  return {
    SURFACE: t.palette.background.paper,
    BORDER: t.palette.divider,
    TEXT: t.palette.text.primary,
    MUTED: t.palette.text.secondary,
    ACCENT: t.palette.primary.main,
    ACCENT_SOFT: alpha(t.palette.primary.main, 0.16),
  };
};

// Identité visuelle approximative de chaque opérateur — pas de logos,
// juste une couleur de marque pour une reconnaissance rapide en un coup d'œil.
const PROVIDERS = {
  orange_money: { label: "Orange Money", color: "#FF6600", textColor: "#fff" },
  moov_money: { label: "Moov Money", color: "#0066B3", textColor: "#fff" },
  wave: { label: "Wave", color: "#1DC8E0", textColor: "#0A2540" },
  virement_bancaire: {
    label: "Virement bancaire",
    color: "#37474F",
    textColor: "#fff",
  },
};

function getProviderVisual(provider) {
  return (
    PROVIDERS[provider] || {
      label: provider,
      color: "#616161",
      textColor: "#fff",
    }
  );
}

const getDarkInputSx = ({ TEXT, BORDER, ACCENT, MUTED }) => ({
  "& .MuiOutlinedInput-root": {
    color: TEXT,
    borderRadius: 2,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: MUTED },
    "&.Mui-focused fieldset": { borderColor: ACCENT },
  },
  "& .MuiInputLabel-root": { color: MUTED },
  "& .MuiFormHelperText-root": { color: MUTED },
  "& .MuiSelect-icon": { color: MUTED },
});

// ---------------------------------------------------------------------------
// Badge provider — pastille colorée + nom, réutilisé carte + formulaire
// ---------------------------------------------------------------------------
function ProviderBadge({ provider, size = "medium" }) {
  const visual = getProviderVisual(provider);
  const isLarge = size === "large";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: isLarge ? 1.5 : 1.25,
        py: isLarge ? 0.75 : 0.5,
        borderRadius: 2,
        bgcolor: visual.color,
      }}
    >
      <AccountBalanceWalletOutlinedIcon
        sx={{ fontSize: isLarge ? 18 : 15, color: visual.textColor }}
      />
      <Typography
        sx={{
          color: visual.textColor,
          fontWeight: 700,
          fontSize: isLarge ? "0.85rem" : "0.72rem",
        }}
      >
        {visual.label}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Carte d'un moyen de paiement
// ---------------------------------------------------------------------------
function PaymentMethodCard({ method, onEdit, onDelete, onToggle, toggling }) {
  const { ACCENT, SURFACE, BORDER, TEXT, MUTED } = useLocalTheme();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${BORDER}`,
          bgcolor: SURFACE,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          opacity: method.is_active ? 1 : 0.55,
          transition:
            "box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            borderColor: MUTED,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
          >
            <ProviderBadge provider={method.provider} />
            <Tooltip
              title={
                method.is_active ? "Visible par les clubs" : "Masqué des clubs"
              }
            >
              <Switch
                size="small"
                checked={method.is_active}
                disabled={toggling}
                onChange={() => onToggle(method)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENT },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    bgcolor: ACCENT,
                  },
                }}
              />
            </Tooltip>
          </Stack>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: TEXT, mb: 0.5 }}
          >
            {method.label}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: MUTED, fontFamily: "monospace", letterSpacing: 0.5 }}
          >
            {method.account_number}
          </Typography>

          {method.account_name && (
            <Typography
              variant="caption"
              sx={{ color: MUTED, display: "block", mt: 0.5 }}
            >
              {method.account_name}
            </Typography>
          )}
        </CardContent>

        <CardActions
          sx={{
            justifyContent: "flex-end",
            px: 1.5,
            py: 0.75,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={() => onEdit(method)}
              sx={{ color: ACCENT }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              onClick={() => onDelete(method)}
              sx={{ color: "#EF5350" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );
}

function PaymentMethodSkeleton() {
  const { SURFACE, BORDER } = useLocalTheme();
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}
    >
      <CardContent>
        <Skeleton width={120} height={28} sx={{ borderRadius: 2, mb: 1.5 }} />
        <Skeleton width="70%" height={24} sx={{ mb: 1 }} />
        <Skeleton width="50%" height={20} />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Formulaire création/édition
// ---------------------------------------------------------------------------
const EMPTY_FORM = {
  provider: "",
  label: "",
  account_number: "",
  account_name: "",
};

function PaymentMethodFormDialog({ open, editing, onClose, onSuccess }) {
  const { ACCENT, SURFACE, BORDER, TEXT, MUTED } = useLocalTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              provider: editing.provider,
              label: editing.label,
              account_number: editing.account_number,
              account_name: editing.account_name || "",
            }
          : EMPTY_FORM,
      );
      setErrors({});
      setServerError(null);
    }
  }, [open, editing]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.provider) next.provider = "Choisissez un opérateur.";
    if (!form.label.trim()) next.label = "Le libellé est requis.";
    if (!form.account_number.trim())
      next.account_number = "Le numéro est requis.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        provider: form.provider,
        label: form.label,
        account_number: form.account_number,
        account_name: form.account_name || null,
      };

      const response = editing
        ? await Instance.patch(`/api/payment-methods/${editing.id}`, payload)
        : await Instance.post("/api/payment-methods", payload);

      onSuccess(response.data.data, !!editing);
      onClose();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: SURFACE, color: TEXT } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 800,
        }}
      >
        {editing
          ? "Modifier le moyen de paiement"
          : "Nouveau moyen de paiement"}
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: MUTED }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: BORDER }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {serverError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {serverError}
            </Alert>
          )}

          <FormControl fullWidth error={!!errors.provider} sx={getDarkInputSx({ TEXT, BORDER, ACCENT, MUTED })}>
            <InputLabel>Opérateur</InputLabel>
            <Select
              value={form.provider}
              label="Opérateur"
              onChange={handleChange("provider")}
              disabled={submitting}
              renderValue={(value) =>
                value ? <ProviderBadge provider={value} /> : ""
              }
            >
              {Object.entries(PROVIDERS).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>
                  <ProviderBadge provider={key} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Libellé interne"
            placeholder="ex: Compte principal Orange Money FBK"
            fullWidth
            value={form.label}
            onChange={handleChange("label")}
            error={!!errors.label}
            helperText={
              errors.label ||
              "Pour vous repérer si vous avez plusieurs comptes."
            }
            disabled={submitting}
            sx={getDarkInputSx({ TEXT, BORDER, ACCENT, MUTED })}
          />

          <TextField
            label="Numéro / RIB"
            placeholder="ex: 70 12 34 56"
            fullWidth
            value={form.account_number}
            onChange={handleChange("account_number")}
            error={!!errors.account_number}
            helperText={
              errors.account_number ||
              "Ce que les clubs verront pour vous payer."
            }
            disabled={submitting}
            sx={getDarkInputSx({ TEXT, BORDER, ACCENT, MUTED })}
          />

          <TextField
            label="Nom du titulaire (optionnel)"
            placeholder="ex: Fédération Burkinabè de Karaté"
            fullWidth
            value={form.account_name}
            onChange={handleChange("account_name")}
            disabled={submitting}
            sx={getDarkInputSx({ TEXT, BORDER, ACCENT, MUTED })}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: MUTED, textTransform: "none" }}
        >
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
            "&:hover": { bgcolor: "#4A5AB8", boxShadow: "none" },
          }}
        >
          {submitting
            ? "Enregistrement..."
            : editing
              ? "Enregistrer"
              : "Ajouter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Confirmation de suppression
// ---------------------------------------------------------------------------
function ConfirmDeleteDialog({ open, method, onClose, onConfirm, loading }) {
  const { SURFACE, TEXT, MUTED } = useLocalTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { bgcolor: SURFACE, color: TEXT } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Supprimer ce moyen de paiement ?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: MUTED }}>
          <strong style={{ color: TEXT }}>{method?.label}</strong> ne sera plus
          visible par vos clubs.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: MUTED, textTransform: "none" }}>
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
export default function PaymentMethodIndex() {
  const { ACCENT, ACCENT_SOFT, BORDER, TEXT, MUTED } = useLocalTheme();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await Instance.get("/api/payment-methods");
      setMethods(data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger vos moyens de paiement.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleOpenCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (method) => {
    setEditing(method);
    setFormOpen(true);
  };

  const handleFormSuccess = (saved, wasEditing) => {
    if (wasEditing) {
      setMethods((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
      setToast({
        open: true,
        message: "Moyen de paiement mis à jour.",
        severity: "success",
      });
    } else {
      setMethods((prev) => [...prev, saved]);
      setToast({
        open: true,
        message: "Moyen de paiement ajouté.",
        severity: "success",
      });
    }
  };

  const handleToggle = async (method) => {
    setTogglingId(method.id);
    try {
      const { data } = await Instance.patch(
        `/api/payment-methods/${method.id}/toggle`,
      );
      setMethods((prev) =>
        prev.map((m) => (m.id === method.id ? data.data : m)),
      );
    } catch (err) {
      setToast({
        open: true,
        message:
          err.response?.data?.message || "Erreur lors de la mise à jour.",
        severity: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await Instance.delete(`/api/payment-methods/${deleteTarget.id}`);
      setMethods((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setToast({
        open: true,
        message: "Moyen de paiement supprimé.",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message:
          err.response?.data?.message || "Erreur lors de la suppression.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "primary" }}>
            Moyens de paiement
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {loading
              ? "Chargement…"
              : "Ce que vos clubs verront pour vous régler"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            bgcolor: ACCENT,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#4A5AB8", boxShadow: "none" },
          }}
        >
          Ajouter
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
              <PaymentMethodSkeleton />
            </Grid>
          ))}

        {!loading && methods.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: MUTED,
                border: `1px dashed ${BORDER}`,
                borderRadius: 3,
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, mb: 0.5, color: TEXT }}
              >
                Aucun moyen de paiement configuré
              </Typography>
              <Typography variant="body2" sx={{ mb: 2.5 }}>
                Vos clubs ne sauront pas comment vous régler tant qu'aucun
                compte n'est ajouté.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  color: TEXT,
                  borderColor: BORDER,
                  "&:hover": { borderColor: ACCENT, bgcolor: ACCENT_SOFT },
                }}
              >
                Ajouter votre premier compte
              </Button>
            </Box>
          </Grid>
        )}

        <AnimatePresence mode="popLayout">
          {!loading &&
            methods.map((method) => (
              <Grid item xs={12} sm={6} md={4} key={method.id}>
                <PaymentMethodCard
                  method={method}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteTarget}
                  onToggle={handleToggle}
                  toggling={togglingId === method.id}
                />
              </Grid>
            ))}
        </AnimatePresence>
      </Grid>

      <PaymentMethodFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        method={deleteTarget}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
