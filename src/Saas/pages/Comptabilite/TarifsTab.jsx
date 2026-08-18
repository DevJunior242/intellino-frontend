import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Grid,
  LinearProgress,
  FormHelperText,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  Tooltip,
  FormControlLabel,
} from "@mui/material";
import { Add, Delete, Check, Close } from "@mui/icons-material";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

const DURATION_UNITS = [
  { value: "day", label: "Jours" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Années" },
];

const EMPTY_PLAN = {
  label: "",
  payment_category_id: "",
  price: "",
  duration_value: "",
  duration_unit: "month",
};

const TarifsTab = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newPlan, setNewPlan] = useState(EMPTY_PLAN);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAffectsValidity, setNewCategoryAffectsValidity] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const { activeId } = UseAuth();

  const fetchPricingData = useCallback(async () => {
    if (activeId == null) return;
    try {
      setError({});
      setLoading(true);
      const [resCat, resPlans] = await Promise.all([
        Instance.get("/api/payment-categories"),
        Instance.get(`/api/pricing-plans?club_id=${activeId}`),
      ]);
      setCategories(resCat.data);
      setPlans(resPlans.data);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    fetchPricingData();
  }, [fetchPricingData]);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setIsSubmitting(true);
    try {
      await Instance.post("/api/pricing-plans", {
        ...newPlan,
        club_id: activeId,
      });
      fetchPricingData();
      setNewPlan(EMPTY_PLAN);
      setSuccess("Tarif ajouté au catalogue");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCategorySubmitting(true);
    setError({});
    try {
      const res = await Instance.post("/api/payment-categories", {
        name: newCategoryName.trim(),
        affects_validity: newCategoryAffectsValidity,
      });
      if (res.data.success) {
        setCategories((prev) => [...prev, res.data.category]);
        setNewPlan((prev) => ({ ...prev, payment_category_id: res.data.category.id }));
        setNewCategoryName("");
        setNewCategoryAffectsValidity(false);
        setAddingCategory(false);
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (deletingCategoryId) return;
    setDeletingCategoryId(cat.id);
    try {
      await Instance.delete(`/api/payment-categories/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      if (newPlan.payment_category_id === cat.id) {
        setNewPlan((prev) => ({ ...prev, payment_category_id: "" }));
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleDelete = async (id) => {
    if (deleteId) return;
    try {
      setDeleteId(id);
      const res = await Instance.delete(
        `/api/pricing-plans/${id}?club_id=${activeId}`,
      );
      if (res.data.success) {
        fetchPricingData();
        setSuccess(res.data.message);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggle = async (plan) => {
    setTogglingId(plan.id);
    try {
      const res = await Instance.patch(`/api/pricing-plans/${plan.id}/toggle`);
      if (res.data.success) {
        fetchPricingData();
        setSuccess(res.data.message);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Box>
      {loading && <LinearProgress />}

      <Box sx={{ mb: 2 }}>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="subtitle1" fontWeight="700" mb={2}>
          Ajouter un nouveau forfait
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              error={hasError("label")}
              helperText={getError("label")}
              fullWidth
              label="Nom (ex: Trimestriel)"
              value={newPlan.label}
              onChange={(e) =>
                setNewPlan({ ...newPlan, label: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              error={hasError("price")}
              helperText={getError("price")}
              fullWidth
              type="number"
              label="Prix (XOF)"
              value={newPlan.price}
              onChange={(e) =>
                setNewPlan({ ...newPlan, price: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              error={hasError("duration_value")}
              helperText={getError("duration_value")}
              fullWidth
              type="number"
              label="Durée"
              value={newPlan.duration_value}
              onChange={(e) =>
                setNewPlan({ ...newPlan, duration_value: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Catégorie
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  clickable
                  color={newPlan.payment_category_id === cat.id ? "primary" : "default"}
                  variant={newPlan.payment_category_id === cat.id ? "filled" : "outlined"}
                  onClick={() =>
                    setNewPlan({ ...newPlan, payment_category_id: cat.id })
                  }
                  onDelete={
                    !cat.is_system
                      ? () => handleDeleteCategory(cat)
                      : undefined
                  }
                  disabled={deletingCategoryId === cat.id}
                />
              ))}
              {!addingCategory && (
                <Chip
                  label="+ Nouvelle catégorie"
                  variant="outlined"
                  clickable
                  onClick={() => setAddingCategory(true)}
                  sx={{ borderStyle: "dashed" }}
                />
              )}
            </Stack>
            {hasError("payment_category_id") && (
              <FormHelperText error>
                {getError("payment_category_id")}
              </FormHelperText>
            )}

            {addingCategory && (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, mt: 1.5, borderRadius: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
              >
                <TextField
                  size="small"
                  autoFocus
                  label="Nom de la catégorie"
                  placeholder="ex: Cours particulier"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  sx={{ minWidth: 220 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={newCategoryAffectsValidity}
                      onChange={(e) => setNewCategoryAffectsValidity(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="caption">Affecte la validité de l'adhésion</Typography>
                  }
                />
                <IconButton
                  color="primary"
                  size="small"
                  disabled={categorySubmitting || !newCategoryName.trim()}
                  onClick={handleAddCategory}
                >
                  <Check />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setAddingCategory(false);
                    setNewCategoryName("");
                    setNewCategoryAffectsValidity(false);
                  }}
                >
                  <Close />
                </IconButton>
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Unité de durée
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={newPlan.duration_unit}
              onChange={(e, value) =>
                value && setNewPlan({ ...newPlan, duration_unit: value })
              }
            >
              {DURATION_UNITS.map((u) => (
                <ToggleButton key={u.value} value={u.value} sx={{ textTransform: "none" }}>
                  {u.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {hasError("duration_unit") && (
              <FormHelperText error>{getError("duration_unit")}</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              disabled={isSubmitting || loading}
              onClick={handleAddPlan}
              variant="contained"
              startIcon={<Add />}
            >
              {isSubmitting ? "Enregistrement..." : "Ajouter le forfait"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "background.default",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Libellé</b></TableCell>
              <TableCell><b>Catégorie</b></TableCell>
              <TableCell><b>Prix</b></TableCell>
              <TableCell><b>Durée</b></TableCell>
              <TableCell align="center"><b>Actif</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan.id} sx={{ opacity: plan.is_active ? 1 : 0.5 }}>
                  <TableCell>{plan.label}</TableCell>
                  <TableCell>{plan.payment_category?.name}</TableCell>
                  <TableCell>{plan.price} XOF</TableCell>
                  <TableCell>
                    {plan.duration_value} {plan.duration_unit}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={plan.is_active ? "Visible à l'encaissement" : "Masqué de l'encaissement"}>
                      <Switch
                        size="small"
                        checked={!!plan.is_active}
                        disabled={togglingId === plan.id}
                        onChange={() => handleToggle(plan)}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(plan.id)}
                      disabled={deleteId === plan.id}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>Aucun tarif pour le moment</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TarifsTab;
