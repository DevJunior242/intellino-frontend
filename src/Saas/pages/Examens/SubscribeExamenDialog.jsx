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
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";

const ACCENT = "#3949AB";
const MUTED = "#6B7280";

export default function SubscribeExamenDialog({
  open,
  examen,
  onClose,
  onSuccess,
  setToast,
}) {
  const { activeId } = UseAuth();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (!open || !activeId) return;

    let active = true;
    setLoadingStudents(true);
    setLoadError(null);

    Instance.get("/api/students", { params: { club_id: activeId } })
      .then(({ data }) => {
        if (active) setStudents(data.students || []);
      })
      .catch((err) => {
        if (active) {
          setLoadError(
            err.response?.data?.message ||
              "Impossible de charger les élèves.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingStudents(false);
      });

    return () => {
      active = false;
    };
  }, [open, activeId]);

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

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter((s) => s.fullname?.toLowerCase().includes(q));
  }, [students, search]);

  const handleSubmit = async () => {
    if (!examen || selectedIds.length === 0) {
      setServerError("Sélectionnez au moins un élève.");
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const { data } = await Instance.post(
        `/api/candidats/batch/${examen.id}`,
        { student_ids: selectedIds },
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
          S'inscrire à l'examen
          {examen?.nextGrade?.name && (
            <Typography
              variant="body2"
              sx={{ color: MUTED, fontWeight: 500, mt: 0.25 }}
            >
              Passage vers : {examen.nextGrade.name}
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
            Sélectionnez les élèves de votre club à inscrire à cet examen.
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un élève..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loadingStudents}
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
          {loadingStudents && (
            <Stack spacing={1} sx={{ px: 2, py: 1 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={44} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          )}

          {!loadingStudents && !loadError && filteredStudents.length === 0 && (
            <Box sx={{ textAlign: "center", py: 5, color: MUTED }}>
              <PersonOutlineIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">
                {search
                  ? "Aucun élève ne correspond à votre recherche."
                  : "Aucun élève trouvé dans votre club."}
              </Typography>
            </Box>
          )}

          {!loadingStudents && filteredStudents.length > 0 && (
            <List dense disablePadding>
              {filteredStudents.map((s) => {
                const checked = selectedIds.includes(s.id);
                return (
                  <ListItem key={s.id} disablePadding>
                    <ListItemButton
                      onClick={() => toggleSelected(s.id)}
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
                        primary={s.fullname}
                        secondary={s.birthdate}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                        secondaryTypographyProps={{ fontSize: "0.78rem" }}
                      />
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
