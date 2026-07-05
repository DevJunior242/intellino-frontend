import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  TextField,
  Alert,
  Skeleton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Instance } from "../../../Api/Axios";

const SURFACE = "#1A1D29";
const BORDER = "rgba(255, 255, 255, 0.08)";
const TEXT = "#F5F5F7";
const MUTED = "rgba(245, 245, 247, 0.6)";
const ACCENT = "#5C6BC0";

// Couleurs des opérateurs — cohérent avec PaymentMethodIndex
const PROVIDER_COLORS = {
  orange_money: { bg: "#FF6600", text: "#fff", label: "Orange Money" },
  moov_money: { bg: "#0066B3", text: "#fff", label: "Moov Money" },
  wave: { bg: "#1DC8E0", text: "#0A2540", label: "Wave" },
  virement_bancaire: {
    bg: "#37474F",
    text: "#fff",
    label: "Virement bancaire",
  },
};

function getProvider(provider) {
  return (
    PROVIDER_COLORS[provider] || {
      bg: "#616161",
      text: "#fff",
      label: provider,
    }
  );
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const darkInputSx = {
  "& .MuiOutlinedInput-root": {
    color: TEXT,
    bgcolor: "rgba(255,255,255,0.04)",
    borderRadius: 2,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.24)" },
    "&.Mui-focused fieldset": { borderColor: ACCENT },
  },
  "& .MuiInputLabel-root": { color: MUTED },
  "& .MuiFormHelperText-root": { color: MUTED },
};

// ---------------------------------------------------------------------------
// Composant principal
//
// Props :
// - open           : boolean
// - payment        : objet StagePayment ou LicencePayment (doit contenir id, amount,
//                    organisateur_id + organisateur_type pour stages,
//                    ou federation_id pour licences)
// - declarerEndpoint : ex: `/api/stage-payments/${id}/declarer`
//                       ou `/api/licence-payments/${id}/declarer`
// - organisateurId : id de la ligue/fédé dont on veut afficher les moyens de paiement
// - organisateurType : 'Ligue' ou 'Federation'
// - onClose        : callback fermeture
// - onSuccess      : callback(paymentMisAJour)
// - setToast       : callback toast global
// ---------------------------------------------------------------------------
export default function PaymentDeclarationDialog({
  open,
  payment,
  declarerEndpoint,
  onClose,
  onSuccess,
  setToast,
  organisateurType,
  organisateurId,
}) {
  const [methods, setMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Charge les moyens de paiement actifs de l'organisateur cible
  useEffect(() => {
    if (!open) return;

    let active = true;
    setLoadingMethods(true);
    setLoadError(null);
    setSelectedMethodId(null);
    setSenderNumber("");
    setTransactionId("");
    setErrors({});
    setServerError(null);

    Instance.get(`/api/payment-methods/${organisateurType}/${organisateurId}`)
      .then(({ data }) => {
        if (active) setMethods(data.data || []);
      })
      .catch((err) => {
        if (active)
          setLoadError(
            err.response?.data?.message ||
              "Impossible de charger les moyens de paiement.",
          );
      })
      .finally(() => {
        if (active) setLoadingMethods(false);
      });

    return () => {
      active = false;
    };
  }, [open, organisateurType, organisateurId]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const validate = () => {
    const next = {};
    if (!selectedMethodId) next.method = "Choisissez un moyen de paiement.";
    if (!senderNumber.trim())
      next.senderNumber = "Indiquez votre numéro d'envoi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !declarerEndpoint) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const { data } = await Instance.post(declarerEndpoint, {
        payment_method_id: selectedMethodId,
        sender_number: senderNumber.trim(),
        transaction_id: transactionId.trim() || null,
      });

      setToast?.({
        open: true,
        message: "Paiement déclaré avec succès !",
        severity: "success",
      });
      onSuccess?.(data.data);
      onClose();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMethod = methods.find((m) => m.id === selectedMethodId);
  const provider = selectedMethod ? getProvider(selectedMethod.provider) : null;

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
        <Box>
          Déclarer un paiement
          {payment?.amount && (
            <Typography
              variant="body2"
              sx={{ color: MUTED, fontWeight: 500, mt: 0.25 }}
            >
              Montant à payer : {formatAmount(payment.amount)} FCFA
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: MUTED }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, borderColor: BORDER }}>
        {serverError && (
          <Alert severity="error" sx={{ borderRadius: 2, m: 2 }}>
            {serverError}
          </Alert>
        )}

        {/* Étape 1 — Choisir le moyen de paiement */}
        <Box sx={{ p: 2.5, pb: 1.5 }}>
          <Typography
            variant="overline"
            sx={{ color: MUTED, letterSpacing: 1.5 }}
          >
            1. Choisissez le compte à créditer
          </Typography>

          {errors.method && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: "block", mt: 0.5 }}
            >
              {errors.method}
            </Typography>
          )}
        </Box>

        {loadingMethods && (
          <Stack spacing={1} sx={{ px: 2.5, pb: 2 }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton
                key={i}
                height={64}
                sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)" }}
              />
            ))}
          </Stack>
        )}

        {loadError && (
          <Alert severity="error" sx={{ borderRadius: 2, mx: 2.5, mb: 2 }}>
            {loadError}
          </Alert>
        )}

        {!loadingMethods && !loadError && methods.length === 0 && (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Aucun moyen de paiement disponible pour cet organisateur.
              Contactez-les directement.
            </Alert>
          </Box>
        )}

        {!loadingMethods && methods.length > 0 && (
          <List disablePadding sx={{ px: 1.5, pb: 1 }}>
            {methods.map((method) => {
              const p = getProvider(method.provider);
              const isSelected = selectedMethodId === method.id;
              return (
                <ListItem key={method.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => setSelectedMethodId(method.id)}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${isSelected ? ACCENT : BORDER}`,
                      bgcolor: isSelected
                        ? "rgba(92, 107, 192, 0.08)"
                        : "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Radio
                      checked={isSelected}
                      size="small"
                      sx={{
                        color: MUTED,
                        "&.Mui-checked": { color: ACCENT },
                        mr: 1,
                      }}
                    />
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: p.bg,
                        mr: 2,
                        minWidth: 110,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: p.text,
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      >
                        {p.label}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={method.label}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.85rem",
                              color: TEXT,
                            }}
                          >
                            {method.account_number}
                          </Typography>
                          {method.account_name && (
                            <Typography
                              component="span"
                              sx={{
                                color: MUTED,
                                fontSize: "0.78rem",
                                display: "block",
                              }}
                            >
                              {method.account_name}
                            </Typography>
                          )}
                        </>
                      }
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        color: TEXT,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}

        <Divider sx={{ borderColor: BORDER }} />

        {/* Étape 2 — Saisir les infos du transfert */}
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Typography
            variant="overline"
            sx={{ color: MUTED, letterSpacing: 1.5, mb: 2, display: "block" }}
          >
            2. Confirmez votre transfert
          </Typography>

          <Stack spacing={2}>
            {/* Récapitulatif du compte choisi */}
            {selectedMethod && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: `1px solid ${BORDER}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: MUTED, mb: 0.5, fontSize: "0.78rem" }}
                >
                  Envoyez {formatAmount(payment?.amount)} FCFA au numéro :
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: TEXT,
                    fontFamily: "monospace",
                    letterSpacing: 1,
                  }}
                >
                  {selectedMethod.account_number}
                </Typography>
                {selectedMethod.account_name && (
                  <Typography variant="caption" sx={{ color: MUTED }}>
                    {selectedMethod.account_name}
                  </Typography>
                )}
              </Box>
            )}

            <TextField
              label="Votre numéro d'envoi"
              placeholder="ex: 70 12 34 56"
              fullWidth
              size="small"
              value={senderNumber}
              onChange={(e) => {
                setSenderNumber(e.target.value);
                setErrors((prev) => ({ ...prev, senderNumber: undefined }));
              }}
              error={!!errors.senderNumber}
              helperText={
                errors.senderNumber ||
                "Le numéro depuis lequel vous avez envoyé l'argent."
              }
              disabled={submitting}
              sx={darkInputSx}
            />

            <TextField
              label="Référence / ID de transaction (optionnel)"
              placeholder="ex: OM2026062912345"
              fullWidth
              size="small"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              helperText="Visible dans votre SMS de confirmation Orange Money, Wave, etc."
              disabled={submitting}
              sx={darkInputSx}
            />
          </Stack>
        </Box>
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
          disabled={submitting || !selectedMethodId || methods.length === 0}
          sx={{
            bgcolor: ACCENT,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#4A5AB8", boxShadow: "none" },
          }}
        >
          {submitting ? "Envoi..." : "Confirmer la déclaration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
