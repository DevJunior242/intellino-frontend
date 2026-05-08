import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import { act, useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../../../Api/AuthContext";
import { Instance } from "../../../../Api/Axios";

// ─── épreuve vide ────────────────────────────────────────────────────────────
const EPREUVE_VIDE = {
  category_id: "",
  disciplineleague_id: "",
  niveau_id: "",
  heure_debut_prevu: "",
  heure_fin_prevue: "",
};

// ─── couleur discipline ───────────────────────────────────────────────────────
const DISC_COLOR = { kata: "success", kumite: "error" };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function CreateEvenement({ open, handleClose, getEvenements }) {
  const { activeId, activeType } = UseAuth();

  // ── données API ─────────────────────────────────────────────────────────────
  const [niveaux, setNiveaux] = useState([]);
  const [categories, setCategories] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // ── formulaire ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    nom: "",
    lieu: "",
    date_debut: "",
    date_fin: "",
  });

  const [epreuves, setEpreuves] = useState([{ ...EPREUVE_VIDE }]);

  // ── état submit ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // ── fetch initial ───────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoadingInit(true);
    try {
      const [discRes, catRes, nivRes] = await Promise.all([
        Instance.get(
          `/api/disciplineLeague?organisateur_id=${activeId}&organisateur_type=${activeType}`,
        ),
        Instance.get(
          `/api/getCategories?organisateur_id=${activeId}&organisateur_type=${activeType}`,
        ),
        Instance.get("/api/niveaux-competitions/niveaux-competitions"),
      ]);
      console.log(discRes);
      console.log(catRes);
      console.log(nivRes);
      setDisciplines(discRes.data || []);
      setCategories(catRes.data || []);
      setNiveaux(nivRes.data || []);
    } catch (err) {
      console.error("Erreur chargement data", err);
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchAllData();
  }, [open, fetchAllData]);

  // ── helpers épreuves ────────────────────────────────────────────────────────
  const handleEpreuveChange = (index, field, value) => {
    setEpreuves((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addEpreuve = () =>
    setEpreuves((prev) => [...prev, { ...EPREUVE_VIDE }]);

  const removeEpreuve = (index) =>
    setEpreuves((prev) => prev.filter((_, i) => i !== index));

  // ── reset ────────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ nom: "", lieu: "", date_debut: "", date_fin: "" });
    setEpreuves([{ ...EPREUVE_VIDE }]);
    setErrors({});
    setSuccess("");
  };

  const handleCloseClean = () => {
    resetForm();
    handleClose();
  };

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    // Validation basique côté client
    const errs = {};
    if (!formData.nom.trim()) errs.nom = "Nom obligatoire";
    if (!formData.lieu.trim()) errs.lieu = "Lieu obligatoire";
    if (!formData.date_debut) errs.date_debut = "Date début obligatoire";
    if (!formData.date_fin) errs.date_fin = "Date fin obligatoire";
    if (formData.date_fin < formData.date_debut)
      errs.date_fin = "Date fin doit être après la date début";

    epreuves.forEach((ep, i) => {
      if (!ep.category_id) errs[`ep_${i}_cat`] = true;
      if (!ep.disciplineleague_id) errs[`ep_${i}_disc`] = true;
      if (!ep.niveau_id) errs[`ep_${i}_niv`] = true;
      if (!ep.heure_debut_prevu) errs[`ep_${i}_deb`] = true;
      if (!ep.heure_fin_prevue) errs[`ep_${i}_fin`] = true;
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        epreuves,
        organisateur_id: activeId,
        organisateur_type: activeType,
      };
      const res = await Instance.post("/api/evenements/evenements", payload);
      setSuccess("Événement créé avec succès !");
      setTimeout(handleCloseClean, 1500);
      getEvenements();
    } catch (err) {
      // Erreurs Laravel 422
      if (err.response?.status === 422) {
        const laravelErrors = {};
        Object.entries(err.response.data.errors ?? {}).forEach(
          ([key, msgs]) => {
            laravelErrors[key] = msgs[0];
          },
        );
        setErrors(laravelErrors);
      } else {
        setErrors({
          global: err.response?.data?.message ?? "Erreur serveur inattendue.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── rendu discipline badge ───────────────────────────────────────────────────
  const getDisciplineNom = (id) =>
    disciplines.find((d) => d.id === id)?.nom ?? "";

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <Dialog open={open} onClose={handleCloseClean} maxWidth="md" fullWidth>
      {/* ── Titre ── */}
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <EmojiEventsIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Créer un événement sportif
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Chargement initial */}
        {loadingInit ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Erreur globale */}
            {errors.global && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.global}
              </Alert>
            )}

            {/* Succès */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* ── SECTION 1 : Informations générales ── */}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                mb: 2,
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <EmojiEventsIcon fontSize="small" />
              1. Informations générales
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nom de l'événement"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  error={!!errors.nom}
                  helperText={errors.nom}
                  placeholder="Ex: Open Karaté 2026"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Lieu / Salle"
                  value={formData.lieu}
                  onChange={(e) =>
                    setFormData({ ...formData, lieu: e.target.value })
                  }
                  error={!!errors.lieu}
                  helperText={errors.lieu}
                  placeholder="Ex: Salle omnisports de Ouaga"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date de début"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_debut}
                  onChange={(e) =>
                    setFormData({ ...formData, date_debut: e.target.value })
                  }
                  error={!!errors.date_debut}
                  helperText={errors.date_debut}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date de fin"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: formData.date_debut }}
                  value={formData.date_fin}
                  onChange={(e) =>
                    setFormData({ ...formData, date_fin: e.target.value })
                  }
                  error={!!errors.date_fin}
                  helperText={errors.date_fin}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* ── SECTION 2 : Épreuves ── */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SportsMartialArtsIcon fontSize="small" />
                2. Programme des épreuves
                <Chip
                  label={epreuves.length}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                variant="outlined"
                size="small"
                onClick={addEpreuve}
              >
                Ajouter une épreuve
              </Button>
            </Stack>

            {/* Erreur épreuves globale */}
            {Object.keys(errors).some((k) => k.startsWith("ep_")) && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Veuillez compléter tous les champs des épreuves.
              </Alert>
            )}

            <Stack spacing={2}>
              {epreuves.map((epreuve, index) => {
                const discNom = getDisciplineNom(epreuve.disciplineleague_id);
                const discColor =
                  DISC_COLOR[discNom?.toLowerCase()] ?? "default";
                const hasError = Object.keys(errors).some((k) =>
                  k.startsWith(`ep_${index}`),
                );

                return (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{
                      position: "relative",
                      borderColor: hasError ? "error.main" : "divider",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <CardContent>
                      {/* Header épreuve */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="text.secondary"
                          >
                            Épreuve {index + 1}
                          </Typography>
                          {discNom && (
                            <Chip
                              label={discNom}
                              size="small"
                              color={discColor}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                        {epreuves.length > 1 && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeEpreuve(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>

                      <Grid container spacing={2}>
                        {/* Catégorie */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            fullWidth
                            required
                            label="Catégorie & Sexe"
                            value={epreuve.category_id}
                            onChange={(e) =>
                              handleEpreuveChange(
                                index,
                                "category_id",
                                e.target.value,
                              )
                            }
                            error={!!errors[`ep_${index}_cat`]}
                          >
                            {categories.length === 0 ? (
                              <MenuItem disabled>Aucune catégorie</MenuItem>
                            ) : (
                              categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                  {cat.nom} — {cat.sexe}
                                </MenuItem>
                              ))
                            )}
                          </TextField>
                        </Grid>

                        {/* Discipline */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            fullWidth
                            required
                            label="Discipline"
                            value={epreuve.disciplineleague_id}
                            onChange={(e) =>
                              handleEpreuveChange(
                                index,
                                "disciplineleague_id",
                                e.target.value,
                              )
                            }
                            error={!!errors[`ep_${index}_disc`]}
                          >
                            {disciplines.length === 0 ? (
                              <MenuItem disabled>Aucune discipline</MenuItem>
                            ) : (
                              disciplines.map((d) => (
                                <MenuItem key={d.id} value={d.id}>
                                  {d.nom}
                                </MenuItem>
                              ))
                            )}
                          </TextField>
                        </Grid>

                        {/* Niveau */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            fullWidth
                            required
                            label="Niveau"
                            value={epreuve.niveau_id}
                            onChange={(e) =>
                              handleEpreuveChange(
                                index,
                                "niveau_id",
                                e.target.value,
                              )
                            }
                            error={!!errors[`ep_${index}_niv`]}
                          >
                            {niveaux.length === 0 ? (
                              <MenuItem disabled>Aucun niveau</MenuItem>
                            ) : (
                              niveaux.map((n) => (
                                <MenuItem key={n.id} value={n.id}>
                                  {n.nom}
                                </MenuItem>
                              ))
                            )}
                          </TextField>
                        </Grid>

                        {/* Bloc horaire */}
                        <Grid item xs={12} md={5}>
                          <TextField
                            fullWidth
                            required
                            type="datetime-local"
                            label="Début du bloc"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                              min: formData.date_debut
                                ? `${formData.date_debut}T00:00`
                                : undefined,
                            }}
                            value={epreuve.heure_debut_prevu}
                            onChange={(e) =>
                              handleEpreuveChange(
                                index,
                                "heure_debut_prevu",
                                e.target.value,
                              )
                            }
                            error={!!errors[`ep_${index}_deb`]}
                          />
                        </Grid>

                        <Grid item xs={12} md={5}>
                          <TextField
                            fullWidth
                            required
                            type="datetime-local"
                            label="Fin du bloc"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                              min: epreuve.heure_debut_prevu || undefined,
                            }}
                            value={epreuve.heure_fin_prevue}
                            onChange={(e) =>
                              handleEpreuveChange(
                                index,
                                "heure_fin_prevue",
                                e.target.value,
                              )
                            }
                            error={!!errors[`ep_${index}_fin`]}
                          />
                        </Grid>

                        {/* Résumé horaire */}
                        {epreuve.heure_debut_prevu &&
                          epreuve.heure_fin_prevue && (
                            <Grid
                              item
                              xs={12}
                              md={2}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Chip
                                label={`${new Date(epreuve.heure_debut_prevu).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – ${new Date(epreuve.heure_fin_prevue).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            </Grid>
                          )}
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>

            {/* ── Bouton submit ── */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 4, py: 1.8 }}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <EmojiEventsIcon />
                )
              }
            >
              {loading
                ? "Création en cours..."
                : `Créer l'événement — ${epreuves.length} épreuve${epreuves.length > 1 ? "s" : ""}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
