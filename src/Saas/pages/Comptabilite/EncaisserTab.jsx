import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Stack,
  CircularProgress,
  Avatar,
  Alert,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Save, Receipt } from "@mui/icons-material";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import StudentAutocomplete from "../StudentAutocomplete";

const PAYMENT_METHODS = [
  { value: "cash", label: "Espèces" },
  { value: "orange_money", label: "Orange Money" },
  { value: "moov_money", label: "Moov Money" },
  { value: "transfer", label: "Virement" },
];

const EncaisserTab = ({ prefill, onDone }) => {
  const { activeId } = UseAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});

  const [selectedStudent, setSelectedStudent] = useState(
    prefill?.student || null,
  );
  const [selectedPlanId, setSelectedPlanId] = useState(
    prefill?.pricing_plan_id || "",
  );
  const [formData, setFormData] = useState({
    amount_paid: prefill?.amount_remaining || "",
    payment_method: "cash",
    starts_at: new Date().toISOString().split("T")[0],
    notes: prefill ? "Règlement de reliquat" : "",
  });

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [debtInfo, setDebtInfo] = useState({ debt: 0, isNewPurchase: true });

  useEffect(() => {
    if (prefill) {
      setSelectedStudent(prefill.student || null);
      setSelectedPlanId(prefill.pricing_plan_id || "");
      setFormData((prev) => ({
        ...prev,
        amount_paid: prefill.amount_remaining || "",
        notes: "Règlement de reliquat",
      }));
    }
  }, [prefill]);

  useEffect(() => {
    const fetchDebt = async () => {
      if (selectedStudent?.id && selectedPlanId) {
        try {
          const res = await Instance.get(
            `/api/payments/students/${selectedStudent.id}/debt/${selectedPlanId}?club_id=${activeId}`,
          );
          setDebtInfo({
            debt: res.data.debt,
            isNewPurchase: res.data.is_new_purchase,
          });
          if (!res.data.is_new_purchase) {
            setFormData((prev) => ({ ...prev, amount_paid: res.data.debt }));
          }
        } catch (err) {
          console.error("Erreur dette:", err);
        }
      }
    };
    fetchDebt();
  }, [selectedStudent, selectedPlanId, activeId]);

  const remainingAfterInput =
    debtInfo.debt - (parseFloat(formData.amount_paid) || 0);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await Instance.get(
          `/api/pricing-plans?club_id=${activeId}&active=1`,
        );
        setPlans(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (activeId) fetchPlans();
  }, [activeId]);

  const handlePlanChange = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    setSelectedPlanId(planId);
    setFormData((prev) => ({
      ...prev,
      amount_paid: plan ? plan.price : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({});
    setSuccess("");
    try {
      const res = await Instance.post("/api/payments", {
        student_id: selectedStudent?.id,
        pricing_plan_id: selectedPlanId,
        ...formData,
        club_id: activeId,
      });
      if (res.data.success) {
        setSuccess(res.data.message || "Paiement enregistré avec succès !");
        setSelectedStudent(null);
        setSelectedPlanId("");
        setFormData({
          amount_paid: "",
          payment_method: "cash",
          starts_at: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setTimeout(() => {
          setSuccess("");
          onDone?.();
        }, 1200);
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        maxWidth: 640,
        mx: "auto",
        backgroundColor: "background.default",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <Receipt />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Nouvel Encaissement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enregistrez une cotisation ou une inscription
          </Typography>
        </Box>
      </Stack>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.general}
        </Alert>
      )}
      {!debtInfo.isNewPurchase && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cet élève a une dette de {debtInfo.debt.toLocaleString()} XOF pour ce
          forfait. Enregistrer un paiement ici réduira cette dette.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <StudentAutocomplete
          activeId={activeId}
          value={selectedStudent}
          onChange={(val) => setSelectedStudent(val)}
          hasError={hasError}
          getError={getError}
          label="Choisir un élève"
        />

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Forfait
          </Typography>
          <Grid container spacing={1}>
            {plans.length > 0 ? (
              plans.map((plan) => {
                const selected = selectedPlanId === plan.id;
                return (
                  <Grid item xs={12} sm={6} key={plan.id}>
                    <Paper
                      variant="outlined"
                      onClick={() => handlePlanChange(plan.id)}
                      sx={{
                        p: 1.5,
                        cursor: "pointer",
                        borderRadius: 2,
                        borderColor: selected ? "primary.main" : "divider",
                        borderWidth: selected ? 2 : 1,
                        bgcolor: selected ? "action.selected" : "transparent",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight={selected ? 700 : 500}>{plan.label}</Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                          {plan.price} XOF
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Aucun forfait actif. Ajoutez-en un dans l'onglet Tarifs.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Montant Reçu"
              type="number"
              required
              value={formData.amount_paid}
              onChange={(e) =>
                setFormData({ ...formData, amount_paid: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">XOF</InputAdornment>
                ),
              }}
              error={hasError("amount_paid")}
              helperText={getError("amount_paid")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                height: "56px",
                display: "flex",
                alignItems: "center",
                bgcolor: remainingAfterInput > 0 ? "warning.50" : "grey.50",
                borderColor: remainingAfterInput > 0 ? "warning.main" : "grey.300",
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Reste à payer
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={remainingAfterInput > 0 ? "error.main" : "success.main"}
                >
                  {remainingAfterInput.toLocaleString()} XOF
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={7}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Mode de paiement
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={formData.payment_method}
              onChange={(e, value) =>
                value && setFormData({ ...formData, payment_method: value })
              }
            >
              {PAYMENT_METHODS.map((m) => (
                <ToggleButton key={m.value} value={m.value} sx={{ textTransform: "none" }}>
                  {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Tooltip
              title={
                !debtInfo.isNewPurchase
                  ? "La date est fixée depuis le premier versement"
                  : ""
              }
            >
              <TextField
                fullWidth
                type="date"
                label="Date d'effet"
                disabled={!debtInfo.isNewPurchase}
                value={formData.starts_at}
                onChange={(e) =>
                  setFormData({ ...formData, starts_at: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Tooltip>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Notes (ex: Numéro de reçu, info tranche...)"
          multiline
          rows={2}
          margin="normal"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          startIcon={<Save />}
          disabled={loading || !selectedStudent || !selectedPlanId}
          sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Valider l'encaissement"}
        </Button>
      </form>
    </Paper>
  );
};

export default EncaisserTab;
