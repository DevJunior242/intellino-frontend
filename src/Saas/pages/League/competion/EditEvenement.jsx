import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Stack,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { UseAuth } from "../../../../Api/AuthContext";
import { Instance } from "../../../../Api/Axios";

const EPREUVE_VIDE = {
  id: null,
  category_id: "",
  sub_discipline_id: "",
  niveau_id: "",
  heure_debut_prevu: "",
  heure_fin_prevue: "",
  est_equipe: false,
};

const DISC_COLOR = {
  kumite: "error",
  kata: "success",
};

// Convertit une épreuve reçue de l'API (objets imbriqués category/discipline/niveau)
// vers la forme à plat utilisée par le formulaire.
const toFormEpreuve = (epreuve) => ({
  id: epreuve.id ?? null,
  category_id: epreuve.category?.id ?? "",
  sub_discipline_id: epreuve.discipline?.id ?? "",
  niveau_id: epreuve.niveau?.id ?? "",
  heure_debut_prevu: epreuve.heure_debut_prevu
    ? epreuve.heure_debut_prevu.slice(0, 16) // format datetime-local
    : "",
  heure_fin_prevue: epreuve.heure_fin_prevue
    ? epreuve.heure_fin_prevue.slice(0, 16)
    : "",
  est_equipe: !!epreuve.est_equipe,
  // gardé uniquement pour l'avertissement de suppression, jamais envoyé au backend
  _inscriptions_count: epreuve.inscriptions_count ?? 0,
});

const CHAMP_VERS_SUFFIXE = {
  category_id: "cat",
  sub_discipline_id: "disc",
  niveau_id: "niv",
  heure_debut_prevu: "deb",
  heure_fin_prevue: "fin",
};

const mapLaravelErrors = (laravelErrors) => {
  const mapped = {};

  Object.entries(laravelErrors).forEach(([key, msgs]) => {
    const message = Array.isArray(msgs) ? msgs[0] : msgs;

    // ex: "epreuves.0.heure_fin_prevue" -> index "0", champ "heure_fin_prevue"
    const match = key.match(/^epreuves\.(\d+)\.(\w+)/);

    if (match) {
      const [, index, champ] = match;
      const suffixe = CHAMP_VERS_SUFFIXE[champ];
      if (suffixe) {
        const formKey = `ep_${index}_${suffixe}`;
        mapped[formKey] = message;
        // gardé aussi sous la clé Laravel d'origine, utile si besoin d'affichage détaillé
        mapped[key] = message;
      }
      return;
    }

    // champs de l'événement lui-même (nom, lieu, date_debut, date_fin, epreuves)
    mapped[key] = message;
  });

  return mapped;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function EditEvenement({
  open,
  handleCloseEdit,
  evenement,
  getEvenements,
}) {
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

  // épreuves retirées du formulaire (gardées pour info, supprimées côté serveur
  // au submit via le sync — pas besoin de les renvoyer, juste de ne plus les
  // inclure dans `epreuves`)
  const [removedWithInscriptions, setRemovedWithInscriptions] = useState([]);

  // ── état submit ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // ── fetch listes déroulantes ─────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (!activeId || !activeType) return;
    setLoadingInit(true);
    try {
      const [discRes, catRes, nivRes] = await Promise.all([
        Instance.get(`/api/disciplineLeague`),
        Instance.get(`/api/getCategories`),
        Instance.get("/api/niveaux-competitions/niveaux-competitions"),
      ]);

      setDisciplines(discRes.data || []);
      setCategories(catRes.data || []);
      setNiveaux(nivRes.data || []);
    } catch (err) {
      console.error("Erreur chargement data", err);
    } finally {
      setLoadingInit(false);
    }
  }, [activeId, activeType]);

  useEffect(() => {
    if (open) fetchAllData();
  }, [open, fetchAllData]);

  // ── pré-remplissage depuis l'événement à éditer ──────────────────────────────
  useEffect(() => {
    if (!open || !evenement) return;

    setFormData({
      nom: evenement.nom ?? "",
      lieu: evenement.lieu ?? "",
      date_debut: evenement.date_debut ?? "",
      date_fin: evenement.date_fin ?? "",
    });

    const competitionsExistantes = evenement.competitions ?? [];
    setEpreuves(
      competitionsExistantes.length > 0
        ? competitionsExistantes.map(toFormEpreuve)
        : [{ ...EPREUVE_VIDE }],
    );
    setRemovedWithInscriptions([]);
    setErrors({});
    setSuccess("");
  }, [open, evenement]);

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

  const removeEpreuve = (index) => {
    setEpreuves((prev) => {
      const cible = prev[index];
      // Si l'épreuve existait déjà (a un id) et a des inscriptions,
      // on garde une trace pour afficher un avertissement — la suppression
      // réelle (avec cascade delete des inscriptions) se fera côté serveur
      // au submit, puisqu'elle ne sera plus dans le tableau envoyé.
      if (cible.id && cible._inscriptions_count > 0) {
        setRemovedWithInscriptions((list) => [
          ...list,
          { id: cible.id, count: cible._inscriptions_count },
        ]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── reset / fermeture ────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ nom: "", lieu: "", date_debut: "", date_fin: "" });
    setEpreuves([{ ...EPREUVE_VIDE }]);
    setRemovedWithInscriptions([]);
    setErrors({});
    setSuccess("");
  };

  const handleCloseClean = () => {
    resetForm();
    handleCloseEdit();
  };

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evenement?.id) return;

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
      if (!ep.sub_discipline_id) errs[`ep_${i}_disc`] = true;
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
      // On envoie l'id de chaque épreuve existante (pour update côté serveur)
      // et on omet les champs internes purement front (_inscriptions_count).
      const payload = {
        ...formData,
        epreuves: epreuves.map(({ _inscriptions_count, ...rest }) => rest),
      };

      await Instance.put(`/api/evenements/evenements/${evenement.id}`, payload);
      setSuccess("Événement mis à jour avec succès !");
      setTimeout(handleCloseClean, 1500);
      getEvenements();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(mapLaravelErrors(err.response.data.errors ?? {}));
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <Dialog open={open} onClose={handleCloseClean} maxWidth="md" fullWidth>
      {/* ── Titre ── */}
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <EmojiEventsIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Modifier l'événement
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

            {/* Avertissement épreuves supprimées avec inscriptions existantes */}
            {removedWithInscriptions.length > 0 && (
              <Alert
                severity="warning"
                icon={<WarningAmberRoundedIcon />}
                sx={{ mb: 2 }}
              >
                {removedWithInscriptions.length === 1
                  ? `Une épreuve retirée comportait ${removedWithInscriptions[0].count} inscription(s). Elles seront définitivement supprimées si vous enregistrez.`
                  : `${removedWithInscriptions.length} épreuves retirées comportaient des inscriptions. Elles seront définitivement supprimées si vous enregistrez.`}
              </Alert>
            )}

            <Stack spacing={2}>
              {epreuves.map((epreuve, index) => {
                const discNom = getDisciplineNom(epreuve.sub_discipline_id);
                const discColor =
                  DISC_COLOR[discNom?.toLowerCase()] ?? "default";
                const hasError = Object.keys(errors).some((k) =>
                  k.startsWith(`ep_${index}`),
                );
                const hasInscriptions = epreuve._inscriptions_count > 0;

                return (
                  <Card
                    key={epreuve.id ?? `new-${index}`}
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
                          {hasInscriptions && (
                            <Chip
                              label={`${epreuve._inscriptions_count} inscrit(s)`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                        {epreuves.length > 1 && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeEpreuve(index)}
                            title={
                              hasInscriptions
                                ? "Cette épreuve a des inscriptions : elles seront supprimées"
                                : "Retirer cette épreuve"
                            }
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
                            helperText={
                              typeof errors[`ep_${index}_cat`] === "string"
                                ? errors[`ep_${index}_cat`]
                                : undefined
                            }
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
                            value={epreuve.sub_discipline_id}
                            onChange={(e) =>
                              handleEpreuveChange(
                                index,
                                "sub_discipline_id",
                                e.target.value,
                              )
                            }
                            error={!!errors[`ep_${index}_disc`]}
                            helperText={
                              typeof errors[`ep_${index}_disc`] === "string"
                                ? errors[`ep_${index}_disc`]
                                : undefined
                            }
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
                            helperText={
                              typeof errors[`ep_${index}_niv`] === "string"
                                ? errors[`ep_${index}_niv`]
                                : undefined
                            }
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
                            helperText={
                              typeof errors[`ep_${index}_deb`] === "string"
                                ? errors[`ep_${index}_deb`]
                                : undefined
                            }
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
                            helperText={
                              typeof errors[`ep_${index}_fin`] === "string"
                                ? errors[`ep_${index}_fin`]
                                : undefined
                            }
                          />
                        </Grid>

                        {/* Kata par équipe (Art. 3.5 WKF) */}
                        {discNom?.toLowerCase() === "kata" && (
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={!!epreuve.est_equipe}
                                  onChange={(e) =>
                                    handleEpreuveChange(
                                      index,
                                      "est_equipe",
                                      e.target.checked,
                                    )
                                  }
                                />
                              }
                              label="Kata par équipe (3-4 athlètes, Bunkai en finale)"
                            />
                          </Grid>
                        )}

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
                ? "Enregistrement en cours..."
                : `Enregistrer les modifications — ${epreuves.length} épreuve${epreuves.length > 1 ? "s" : ""}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
