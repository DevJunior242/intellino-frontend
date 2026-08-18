import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";

import Message from "../Message";
import StudentForm from "../Students/StudentForm";

// Ne montre que les candidats déjà éligibles (bon grade, pas déjà
// inscrits, visibles selon la hiérarchie club/ligue/fédération) — cocher
// plusieurs candidats à la fois plutôt qu'un par un, sans risquer un rejet
// après coup pour un mauvais grade.
function AddCandidat({ open, handleClose, examenId, fetchExamen }) {
  const [candidats, setCandidats] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [nouvelAthleteOpen, setNouvelAthleteOpen] = useState(false);

  const fetchEligibles = useCallback(async () => {
    if (!examenId) return;
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await Instance.get(`/api/candidats/eligibles/${examenId}`);
      setCandidats(data.data || []);
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
          "Impossible de charger les candidats éligibles.",
      );
    } finally {
      setLoading(false);
    }
  }, [examenId]);

  useEffect(() => {
    if (open) {
      fetchEligibles();
      setSelectedIds([]);
      setError({});
      setSuccess("");
    }
  }, [open, fetchEligibles]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    setError({});
    setSuccess("");
    try {
      const res = await Instance.post(`/api/candidats/batch/${examenId}`, {
        student_ids: selectedIds,
      });
      if (res.data.success) {
        setSuccess(res.data.message || "Candidats inscrits");
        setTimeout(() => {
          fetchExamen();
          handleClose();
        }, 1000);
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            p: 3,
            borderRadius: 3,
            backgroundColor: "background.default",
          },
        }}
      >
        <Box>
          {success && <Message text={success} type="success" />}
          {error?.general && <Message text={error.general} type="error" />}
          <form onSubmit={handleSubmit}>
            <DialogTitle>Ajouter des candidats</DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Seuls les élèves ayant le grade requis pour cet examen sont
                  proposés ci-dessous.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonAddAlt1Icon />}
                  onClick={() => setNouvelAthleteOpen(true)}
                  sx={{ whiteSpace: "nowrap", textTransform: "none" }}
                >
                  Nouvel athlète
                </Button>
              </Stack>

              <Divider sx={{ my: 1 }} />

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : loadError ? (
                <Message text={loadError} type="error" />
              ) : candidats.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Aucun élève éligible pour le moment (grade requis non
                  atteint, ou déjà tous inscrits). Vous pouvez en créer un
                  nouveau via le bouton ci-dessus.
                </Typography>
              ) : (
                <List
                  dense
                  sx={{
                    maxHeight: 320,
                    overflowY: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  {candidats.map((c) => {
                    const checked = selectedIds.includes(c.id);
                    return (
                      <ListItem key={c.id} disablePadding>
                        <ListItemButton onClick={() => toggleSelected(c.id)}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple />
                          </ListItemIcon>
                          <ListItemText
                            primary={c.fullname}
                            secondary={c.birthdate}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Annuler</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || selectedIds.length === 0}
              >
                {submitting
                  ? "Enregistrement..."
                  : `Inscrire${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Dialog>

      {/* Créer un nouvel athlète sans quitter l'écran d'inscription */}
      <Dialog
        open={nouvelAthleteOpen}
        onClose={() => setNouvelAthleteOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nouvel athlète</DialogTitle>
        <DialogContent>
          <StudentForm
            onSuccess={() => {
              setNouvelAthleteOpen(false);
              fetchEligibles();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddCandidat;
