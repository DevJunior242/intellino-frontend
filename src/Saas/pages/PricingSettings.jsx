import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
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
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Add, Delete, Settings } from "@mui/icons-material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";

const PricingSettings = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newPlan, setNewPlan] = useState({
    label: "",
    payment_category_id: "",
    price: "",
    duration_value: "",
    duration_unit: "month",
  });

  const { activeClubId } = UseAuth();

  const fetchPricingData = useCallback(async () => {
    if (activeClubId == null) return;

    try {
      setError({});
      setLoading(true);

      const [resCat, resPlans] = await Promise.all([
        Instance.get("/api/payment-categories"),
        Instance.get(`/api/pricing-plans?club_id=${activeClubId}`),
      ]);

      setCategories(resCat.data);
      setPlans(resPlans.data);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    fetchPricingData();
  }, [fetchPricingData]);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      await Instance.post("/api/pricing-plans", {
        ...newPlan,
        club_id: activeClubId,
      });
      fetchPricingData();
      setNewPlan({
        label: "",
        payment_category_id: "",
        price: "",
        duration_value: "",
        duration_unit: "month",
      });
    } catch (error) {
      ErrorGlobal({ error, setError });
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setError("");
    }
  };

  const handleDelete = async (id) => {
    if (deleteId) return;
    try {
      setDeleteId(id);
      const res = await Instance.delete(
        `/api/pricing-plans/${id}?club_id=${activeClubId}`,
      );
      console.log(res);
      if (res.data.success) {
        fetchPricingData();
        setSuccess(res.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      ErrorGlobal({ error: err, setError });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading && <LinearProgress />}
      <Typography
        variant="h5"
        fontWeight="700"
        mb={3}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Settings color="primary" /> Configuration des Tarifs
      </Typography>

      {/* message error */}
      <Box sx={{ m: 3 }}>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
      </Box>

      {/* Formulaire d'ajout rapide */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="subtitle1" fontWeight="700" mb={2}>
          Ajouter un nouveau forfait
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth error={hasError("payment_category_id")}>
              <InputLabel id="payment-category-label">Catégorie</InputLabel>
              <Select
                labelId="payment-category-label"
                id="payment-category-select"
                label="Catégorie"
                value={newPlan.payment_category_id}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    payment_category_id: e.target.value,
                  })
                }
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: "background.default" },
                  },
                }}
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Aucune catégorie disponible</MenuItem>
                )}
              </Select>
              {hasError("payment_category_id") && (
                <FormHelperText>
                  {getError("payment_category_id")}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              error={hasError("price")}
              helperText={getError("price")}
              fullWidth
              type="number"
              label="Prix (€)"
              value={newPlan.price}
              onChange={(e) =>
                setNewPlan({ ...newPlan, price: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth error={hasError("duration_unit")}>
              <InputLabel id="duration-unit-label">Unité</InputLabel>
              <Select
                labelId="duration-unit-label"
                id="duration-unit-select"
                label="Unité"
                value={newPlan.duration_unit}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, duration_unit: e.target.value })
                }
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: "background.default" },
                  },
                }}
              >
                <MenuItem value="day">Jours</MenuItem>
                <MenuItem value="month">Mois</MenuItem>
                <MenuItem value="year">Années</MenuItem>
              </Select>
              {hasError("duration_unit") && (
                <FormHelperText>{getError("duration_unit")}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              disabled={isSubmitting || loading}
              onClick={handleAddPlan}
              variant="contained"
              fullWidth
            >
              {isSubmitting ? "Enregistrement..." : <Add />}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des tarifs existants */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "background.default",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>
                <b>Libellé</b>
              </TableCell>
              <TableCell>
                <b>Catégorie</b>
              </TableCell>
              <TableCell>
                <b>Prix</b>
              </TableCell>
              <TableCell>
                <b>Durée</b>
              </TableCell>
              <TableCell align="right">
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.length > 0 ? (
              <>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.label}</TableCell>
                    <TableCell>{plan.payment_category?.name}</TableCell>
                    <TableCell>{plan.price} XOF</TableCell>
                    <TableCell>
                      {plan.duration_value} {plan.duration_unit}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleteId === plan.id}
                      >
                        {deleteId === plan.id ? "Supprimé" : <Delete />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={3}>Aucun tarif pour le moment</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default PricingSettings;
