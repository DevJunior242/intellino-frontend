import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "motion/react";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";

function ConfirmDeletePlanDialog({ open, plan, onClose, onConfirm, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer ce palier ?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          <strong>{plan?.name}</strong> ne sera plus proposé sur la page
          Tarifs. Les abonnements déjà souscrits sur ce palier ne sont pas
          affectés.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const ORG_TYPES = [
  { value: "Club", label: "Club" },
  { value: "Ligue", label: "Ligue" },
  { value: "Federation", label: "Fédération" },
];

const EMPTY_PLAN = {
  name: "",
  description: "",
  amount: "",
  organisateur_type: "Club",
  min_users: "",
  max_users: "",
};

function formatFcfa(amount) {
  return Number(amount).toLocaleString("fr-FR");
}

function Plan() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(EMPTY_PLAN);
  const [submitting, setSubmitting] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [discountPercent, setDiscountPercent] = useState("");
  const [discountSuccess, setDiscountSuccess] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [savingDiscount, setSavingDiscount] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const { data } = await Instance.get("/api/plans");
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    Instance.get("/api/public/annual-discount")
      .then(({ data }) => setDiscountPercent(String(data.percent ?? 0)))
      .catch(() => {});
  }, [fetchPlans]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);
    try {
      const response = editingId
        ? await Instance.patch(`/api/plan/${editingId}`, formData)
        : await Instance.post("/api/plan/store", formData);

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => setSuccess(""), 3000);
        setFormData(EMPTY_PLAN);
        setEditingId(null);
        fetchPlans();
      } else {
        setError({ general: response.data.message });
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan) => {
    setError({});
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      amount: plan.amount,
      organisateur_type: plan.organisateur_type,
      min_users: plan.min_users,
      max_users: plan.max_users ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_PLAN);
    setError({});
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await Instance.delete(`/api/plan/${deleteTarget.id}`);
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) handleCancelEdit();
      fetchPlans();
    } catch (err) {
      setError({
        general: err.response?.data?.message || "Impossible de supprimer ce palier.",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    setDiscountError("");
    setDiscountSuccess("");
    setSavingDiscount(true);
    try {
      const { data } = await Instance.patch("/api/plan/annual-discount", {
        percent: discountPercent,
      });
      setDiscountSuccess(data.message);
      setTimeout(() => setDiscountSuccess(""), 3000);
    } catch (err) {
      setDiscountError(
        err.response?.data?.message ||
          "Impossible d'enregistrer la réduction annuelle.",
      );
    } finally {
      setSavingDiscount(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      {/* ── Réduction annuelle ── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ mt: 6, boxShadow: 6, borderRadius: 2, p: 4 }}
      >
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Réduction annuelle
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Appliquée automatiquement sur la page publique "Tarifs" quand un
          visiteur choisit la facturation annuelle plutôt que mensuelle.
        </Typography>
        {discountSuccess && <Message text={discountSuccess} type="success" />}
        <Box
          component="form"
          onSubmit={handleSaveDiscount}
          sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
        >
          <TextField
            type="number"
            label="Réduction"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            error={!!discountError}
            helperText={discountError}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ min: 0, max: 100 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={savingDiscount}
            sx={{ textTransform: "none", mt: 0.5 }}
          >
            {savingDiscount ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Box>
      </Box>

      {/* ── Nouveau palier ── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        sx={{ mt: 4, boxShadow: 6, borderRadius: 2, p: 4 }}
      >
        <Typography variant="h5" fontWeight={800} gutterBottom>
          {editingId ? "Modifier le palier" : "Ajouter un palier de tarification"}
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, mb: 0.5 }}>
            Type d'organisation
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={formData.organisateur_type}
            onChange={(e, value) =>
              value && setFormData({ ...formData, organisateur_type: value })
            }
          >
            {ORG_TYPES.map((t) => (
              <ToggleButton key={t.value} value={t.value} sx={{ textTransform: "none" }}>
                {t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            error={!!error.name}
            name="name"
            label="Nom du palier"
            placeholder="Ex: Club Starter"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {error.name && (
            <FormHelperText error>{error.name.join(", ")}</FormHelperText>
          )}

          <TextField
            error={!!error.description}
            name="description"
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={handleChange}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              error={!!error.min_users}
              type="number"
              name="min_users"
              label="Utilisateurs min"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.min_users}
              onChange={handleChange}
              required
            />
            <TextField
              error={!!error.max_users}
              type="number"
              name="max_users"
              label="Utilisateurs max (vide = illimité)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.max_users}
              onChange={handleChange}
            />
          </Box>
          {error.max_users && (
            <FormHelperText error>{error.max_users.join(", ")}</FormHelperText>
          )}

          <TextField
            error={!!error.amount}
            type="number"
            name="amount"
            label="Prix mensuel (XOF)"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          {error.amount && (
            <FormHelperText error>{error.amount.join(", ")}</FormHelperText>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{ textTransform: "none" }}
            >
              {submitting
                ? "Enregistrement..."
                : editingId
                  ? "Enregistrer les modifications"
                  : "Ajouter le palier"}
            </Button>
            {editingId && (
              <Button
                onClick={handleCancelEdit}
                disabled={submitting}
                sx={{ textTransform: "none" }}
              >
                Annuler
              </Button>
            )}
          </Box>
        </form>
      </Box>

      {/* ── Liste des paliers existants ── */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Paliers existants
        </Typography>
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Utilisateurs</TableCell>
                <TableCell align="right">Prix / mois</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loadingPlans && plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>Aucun palier pour le moment</TableCell>
                </TableRow>
              )}
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.organisateur_type || "—"}</TableCell>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>
                    {plan.min_users}
                    {plan.max_users != null ? `–${plan.max_users}` : "+"}
                  </TableCell>
                  <TableCell align="right">
                    {Number(plan.amount) === 0 ? "—" : `${formatFcfa(plan.amount)} XOF`}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(plan)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(plan)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <ConfirmDeletePlanDialog
        open={!!deleteTarget}
        plan={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </Container>
  );
}

export default Plan;
