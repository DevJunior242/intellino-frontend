import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
  Typography,
  Alert,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  PersonOutline as PersonOutlineIcon,
} from "@mui/icons-material";
import { Instance } from "../../Api/Axios";

const ACCENT = "#3949AB";
const MUTED = "#6B7280";

export default function SubscribeStageDialog({
  open,
  stage,
  onClose,
  onSuccess,
  setToast,
}) {
  const [pratiquants, setPratiquants] = useState([]);
  const [loadingPratiquants, setLoadingPratiquants] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Charge la liste des pratiquants éligibles (non déjà inscrits à ce stage) dès l'ouverture du dialog
  useEffect(() => {
    if (!open || !stage) return;

    let active = true;
    setLoadingPratiquants(true);
    setLoadError(null);

    Instance.get("/api/mes-pratiquants", { params: { stage_id: stage.id } })
      .then(({ data }) => {
        if (active) setPratiquants(data.data || []);
      })
      .catch((err) => {
        if (active) {
          setLoadError(
            err.response?.data?.message ||
              "Impossible de charger les pratiquants.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingPratiquants(false);
      });

    return () => {
      active = false;
    };
  }, [open, stage]);

  const resetForm = () => {
    setSelectedIds([]);
    setSearch("");
    setServerError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredPratiquants = useMemo(() => {
    if (!search.trim()) return pratiquants;
    const q = search.trim().toLowerCase();
    return pratiquants.filter(
      (p) =>
        p.fullname?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q),
    );
  }, [pratiquants, search]);

  const handleSubmit = async () => {
    if (!stage || selectedIds.length === 0) {
      setServerError("Sélectionnez au moins un pratiquant.");
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const { data } = await Instance.post(
        `/api/stages/${stage.id}/inscriptions`,
        {
          user_ids: selectedIds,
        },
      );

      setToast?.({
        open: true,
        message: "Inscription envoyée avec succès !",
        severity: "success",
      });

      onSuccess?.(data.data, data.payment);
      resetForm();
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        setServerError(
          Object.values(err.response.data.errors).flat().join(" "),
        );
      } else {
        setServerError(
          err.response?.data?.message ||
            "Une erreur est survenue lors de l'inscription.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 800,
        }}
      >
        <Box>
          S'inscrire au stage
          {stage?.title && (
            <Typography
              variant="body2"
              sx={{ color: MUTED, fontWeight: 500, mt: 0.25 }}
            >
              {stage.title}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={submitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2.5, pb: 1.5 }}>
          {serverError && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
              {serverError}
            </Alert>
          )}

          {loadError && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
              {loadError}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: MUTED, mb: 2 }}>
            Sélectionnez les pratiquants de votre club à inscrire à ce stage.
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un pratiquant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loadingPratiquants}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: MUTED }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />

          {selectedIds.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5 }}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label={`${selectedIds.length} sélectionné${selectedIds.length > 1 ? "s" : ""}`}
                size="small"
                onDelete={() => setSelectedIds([])}
                sx={{ bgcolor: "#E8EAF6", color: ACCENT, fontWeight: 600 }}
              />
            </Stack>
          )}
        </Box>

        <Box sx={{ maxHeight: 360, overflowY: "auto", px: 1 }}>
          {loadingPratiquants && (
            <Stack spacing={1} sx={{ px: 2, py: 1 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={44} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          )}

          {!loadingPratiquants &&
            !loadError &&
            filteredPratiquants.length === 0 && (
              <Box sx={{ textAlign: "center", py: 5, color: MUTED }}>
                <PersonOutlineIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2">
                  {search
                    ? "Aucun pratiquant ne correspond à votre recherche."
                    : "Aucun pratiquant éligible trouvé dans votre club."}
                </Typography>
              </Box>
            )}

          {!loadingPratiquants && filteredPratiquants.length > 0 && (
            <List dense disablePadding>
              {filteredPratiquants.map((p) => {
                const checked = selectedIds.includes(p.id);
                return (
                  <ListItem key={p.id} disablePadding>
                    <ListItemButton
                      onClick={() => toggleSelected(p.id)}
                      disabled={submitting}
                      sx={{ borderRadius: 2, mb: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={checked}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={p.fullname}
                        secondary={p.email}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                        secondaryTypographyProps={{ fontSize: "0.78rem" }}
                      />
                      {p.role && (
                        <Chip
                          label={p.role}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: "0.7rem",
                            height: 20,
                            bgcolor: "#F3F4F6",
                            color: "#374151",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={submitting}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || selectedIds.length === 0}
          sx={{
            bgcolor: ACCENT,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#303F9F", boxShadow: "none" },
          }}
        >
          {submitting
            ? "Envoi..."
            : `Inscrire ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
