import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
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
  InputAdornment,
  Snackbar,
  Alert,
  Chip,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Close as CloseIcon,
  VerifiedUser as VerifiedUserIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { Instance } from "../../../Api/Axios";

// Palette dérivée du thème actif (au lieu de valeurs fixes) pour s'adapter
// au clair/sombre des dashboards ligue/fédération.
const useLocalTheme = () => {
  const t = useTheme();
  return {
    ACCENT: t.palette.primary.main,
    ACCENT_SOFT: alpha(t.palette.primary.main, 0.16),
    SURFACE: t.palette.background.paper,
    BORDER: t.palette.divider,
    TEXT: t.palette.text.primary,
    MUTED: t.palette.text.secondary,
  };
};

const PROVIDER_LABELS = {
  orange_money: { label: "Orange Money", color: "#FF6600" },
  moov_money: { label: "Moov Money", color: "#0066B3" },
  wave: { label: "Wave", color: "#1DC8E0" },
  virement_bancaire: { label: "Virement", color: "#37474F" },
};

const getTextFieldDarkSx = ({ TEXT, BORDER, ACCENT, MUTED }) => ({
  "& .MuiOutlinedInput-root": {
    color: TEXT,
    borderRadius: 2,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: MUTED },
    "&.Mui-focused fieldset": { borderColor: ACCENT },
  },
  "& .MuiInputLabel-root": { color: MUTED },
  "& .MuiFormHelperText-root": { color: MUTED },
});

function formatMontant(montant) {
  return Number(montant || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ---------------------------------------------------------------------------
// Formulaire de définition/mise à jour du tarif de la saison en cours
// ---------------------------------------------------------------------------
function TarifFormDialog({ open, current, onClose, onSuccess }) {
  const { ACCENT, SURFACE, BORDER, TEXT, MUTED } = useLocalTheme();
  const [cotisation, setCotisation] = useState("");
  const [error, setError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCotisation(current ? String(current.cotisation) : "");
      setError(null);
      setServerError(null);
    }
  }, [open, current]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (cotisation === "" || Number(cotisation) < 0) {
      setError("Indiquez un montant valide.");
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const { data } = await Instance.post("/api/affiliations/affiliations", {
        cotisation: Number(cotisation),
      });
      onSuccess(data.data);
      onClose();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
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
        {current
          ? "Modifier le tarif d'affiliation"
          : "Définir le tarif d'affiliation"}
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

          <TextField
            label="Cotisation"
            type="number"
            fullWidth
            value={cotisation}
            onChange={(e) => {
              setCotisation(e.target.value);
              setError(null);
            }}
            error={!!error}
            helperText={
              error ||
              "Montant que chaque club doit payer pour la saison en cours."
            }
            disabled={submitting}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ color: MUTED }}>
                  FCFA
                </InputAdornment>
              ),
            }}
            sx={getTextFieldDarkSx({ TEXT, BORDER, ACCENT, MUTED })}
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
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Carte d'une cotisation déclarée par un club, en attente de vérification
// ---------------------------------------------------------------------------
function PaymentCard({ payment, onConfirm, onReject, processing }) {
  const { SURFACE, BORDER, TEXT, MUTED } = useLocalTheme();
  const rawProvider = payment.payment_method?.provider ?? null;
  const provider = PROVIDER_LABELS[rawProvider] || {
    label: rawProvider || "Non renseigné",
    color: "#616161",
  };

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT }}>
              {payment.club?.name || "Club"}
            </Typography>
            <Typography variant="caption" sx={{ color: MUTED }}>
              déclaré le{" "}
              {payment.declared_at
                ? new Date(payment.declared_at).toLocaleDateString("fr-FR")
                : "—"}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, color: TEXT }}>
            {formatMontant(payment.amount)}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: MUTED, ml: 0.5 }}
            >
              FCFA
            </Typography>
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mt: 1.5 }}
        >
          <Chip
            label={provider.label}
            size="small"
            sx={{
              bgcolor: provider.color,
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: MUTED, fontFamily: "monospace" }}
          >
            depuis {payment.sender_number}
          </Typography>
        </Stack>

        {payment.transaction_id && (
          <Typography
            variant="caption"
            sx={{ color: MUTED, display: "block", mt: 0.5 }}
          >
            Réf : {payment.transaction_id}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          size="small"
          startIcon={<CheckCircleIcon fontSize="small" />}
          onClick={() => onConfirm(payment)}
          disabled={processing}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: "#2E7D32",
            color: "#fff",
            "&:hover": { bgcolor: "#1B5E20" },
          }}
        >
          Confirmer
        </Button>
        <Button
          size="small"
          startIcon={<CancelIcon fontSize="small" />}
          onClick={() => onReject(payment)}
          disabled={processing}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            color: "#EF5350",
          }}
        >
          Rejeter
        </Button>
      </CardActions>
    </Card>
  );
}

export default function AffiliationTarifIndex() {
  const { ACCENT, ACCENT_SOFT, SURFACE, BORDER, TEXT, MUTED } =
    useLocalTheme();
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchAffiliations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await Instance.get("/api/affiliations/affiliations");
      setAffiliations(data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger le tarif d'affiliation.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const { data } = await Instance.get("/api/transactions", {
        params: { status: "declared", payable_type: "affiliation" },
      });
      setPendingPayments(data.data || []);
    } catch {
      // silencieux : section secondaire, ne bloque pas le reste de la page
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    fetchAffiliations();
    fetchPendingPayments();
  }, [fetchAffiliations, fetchPendingPayments]);

  const current = affiliations.find((a) => a.saison?.active) || null;

  const handleFormSuccess = (saved) => {
    setAffiliations((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      return exists
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [saved, ...prev];
    });
    setToast({
      open: true,
      message: "Tarif d'affiliation enregistré.",
      severity: "success",
    });
  };

  const handleConfirm = async (payment) => {
    setProcessingId(payment.id);
    try {
      await Instance.patch(`/api/transactions/${payment.id}/confirmer`);
      setPendingPayments((prev) => prev.filter((p) => p.id !== payment.id));
      setToast({
        open: true,
        message: "Affiliation confirmée.",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message:
          err.response?.data?.message || "Erreur lors de la confirmation.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payment) => {
    setProcessingId(payment.id);
    try {
      await Instance.patch(`/api/transactions/${payment.id}/rejeter`);
      setPendingPayments((prev) => prev.filter((p) => p.id !== payment.id));
      setToast({
        open: true,
        message: "Déclaration rejetée.",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur lors du rejet.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: TEXT, mb: 0.5 }}>
        Affiliation
      </Typography>
      <Typography variant="body2" sx={{ color: MUTED, mb: 3 }}>
        Le tarif de cotisation que chaque club de votre fédération doit payer
        pour la saison en cours.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Skeleton height={140} sx={{ borderRadius: 3, mb: 4 }} />
      ) : (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
            mb: 4,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Chip
                  icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                  label={current?.saison?.libele || "Aucune saison active"}
                  size="small"
                  sx={{
                    bgcolor: ACCENT_SOFT,
                    color: ACCENT,
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                />
                {current ? (
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: TEXT }}
                  >
                    {formatMontant(current.cotisation)}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: MUTED, ml: 0.75 }}
                    >
                      FCFA / club
                    </Typography>
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: MUTED, maxWidth: 480 }}
                  >
                    Aucun tarif défini pour la saison active. Définissez-en un
                    pour que vos clubs puissent renouveler leur affiliation.
                  </Typography>
                )}
              </Box>

              <IconButton
                onClick={() => setFormOpen(true)}
                sx={{ color: ACCENT }}
              >
                <EditIcon />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, color: TEXT, mb: 1.5 }}
      >
        Affiliations à vérifier
      </Typography>

      {loadingPayments ? (
        <Skeleton height={140} sx={{ borderRadius: 3 }} />
      ) : pendingPayments.length === 0 ? (
        <Typography variant="body2" sx={{ color: MUTED }}>
          Aucune déclaration en attente de vérification.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {pendingPayments.map((payment) => (
            <Grid item xs={12} sm={6} key={payment.id}>
              <PaymentCard
                payment={payment}
                onConfirm={handleConfirm}
                onReject={handleReject}
                processing={processingId === payment.id}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <TarifFormDialog
        open={formOpen}
        current={current}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
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
