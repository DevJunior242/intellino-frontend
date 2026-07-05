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
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Skeleton,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Cancel as CancelIcon,
  PersonOutline as PersonOutlineIcon,
} from "@mui/icons-material";
import { Instance } from "../../Api/Axios";

const MUTED = "#6B7280";

const PAYMENT_LABELS = {
  pending: { label: "En attente", bg: "#FFF8E1", fg: "#F57F17" },
  paid: { label: "Payé", bg: "#E8F5E9", fg: "#2E7D32" },
};

// Une inscription ne peut plus être annulée si le stage a déjà commencé
function isCancellable(stage) {
  if (!stage?.start_at) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(stage.start_at);
  start.setHours(0, 0, 0, 0);
  return today < start;
}

export default function MyRegistrationsDialog({
  open,
  stage,
  onClose,
  onCancelled,
  setToast,
}) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!open || !stage) return;

    let active = true;
    setLoading(true);
    setError(null);

    Instance.get(`/api/stages/${stage.id}/mes-inscrits`)
      .then(({ data }) => {
        console.log("Registrations data:", data);
        if (active) setRegistrations(data.data || []);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Impossible de charger vos inscrits.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, stage]);

  const handleCancel = async (registration) => {
    setCancellingId(registration.id);
    try {
      await Instance.delete(`/api/inscriptions/${registration.id}`);
      setRegistrations((prev) => prev.filter((r) => r.id !== registration.id));
      setToast?.({
        open: true,
        message: "Inscription annulée.",
        severity: "success",
      });
      onCancelled?.(registration, stage);
    } catch (err) {
      setToast?.({
        open: true,
        message: err.response?.data?.message || "Erreur lors de l'annulation.",
        severity: "error",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const cancellable = isCancellable(stage);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 800,
        }}
      >
        <Box>
          Mes inscrits
          {stage?.title && (
            <Typography
              variant="body2"
              sx={{ color: MUTED, fontWeight: 500, mt: 0.25 }}
            >
              {stage.title}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, m: 2 }}>
            {error}
          </Alert>
        )}

        {!cancellable && !loading && registrations.length > 0 && (
          <Alert severity="info" sx={{ borderRadius: 2, m: 2, mb: 0 }}>
            Ce stage a déjà commencé : les inscriptions ne peuvent plus être
            annulées.
          </Alert>
        )}

        {loading && (
          <Stack spacing={1} sx={{ p: 2.5 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={48} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        )}

        {!loading && !error && registrations.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, color: MUTED }}>
            <PersonOutlineIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Vous n'avez encore inscrit aucun pratiquant à ce stage.
            </Typography>
          </Box>
        )}

        {!loading && registrations.length > 0 && (
          <List disablePadding sx={{ px: 1, py: 1 }}>
            {registrations.map((r) => {
              const payment =
                PAYMENT_LABELS[r.payment_status] || PAYMENT_LABELS.pending;
              return (
                <ListItem
                  key={r.id}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    "&:hover": { bgcolor: "#FAFAFB" },
                  }}
                  secondaryAction={
                    <Tooltip
                      title={
                        cancellable
                          ? "Annuler l'inscription"
                          : "Stage déjà commencé"
                      }
                    >
                      <span>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleCancel(r)}
                          disabled={!cancellable || cancellingId === r.id}
                          sx={{ color: "#D32F2F" }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                >
                  <ListItemText
                    primary={r.user?.fullname}
                    secondary={r.user?.email}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                    secondaryTypographyProps={{ fontSize: "0.78rem" }}
                  />
                  <Chip
                    label={payment.label}
                    size="small"
                    sx={{
                      bgcolor: payment.bg,
                      color: payment.fg,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 22,
                      mr: 5,
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" sx={{ color: MUTED, flexGrow: 1 }}>
          {registrations.length} inscrit{registrations.length > 1 ? "s" : ""}
        </Typography>
        <Button onClick={onClose} color="inherit">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
