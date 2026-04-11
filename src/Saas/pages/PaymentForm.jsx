import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Divider,
  Stack,
  CircularProgress,
  Avatar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Save, Receipt, Person, LocalOffer, Event } from "@mui/icons-material";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import Message from "./Message";
import ErrorGlobal from "../../component/ErrorGlobal";
import StudentAutocomplete from "./StudentAutocomplete";
import { useLocation } from "react-router-dom";

// const PaymentForm = () => {
//   const { activeClubId } = UseAuth();

//   // États
//   const [students, setStudents] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const hasError = (field) => !!error?.[field];
//   const getError = (field) => error?.[field]?.join(", ");
//   // État du formulaire
//   const [formData, setFormData] = useState({
//     student_id: "",
//     pricing_plan_id: "",
//     amount_paid: "",
//     payment_method: "cash",
//     starts_at: "",
//     notes: "",
//   });

//   //student
//   useEffect(() => {
//     if (selectedStudent) {
//       setFormData((prev) => ({ ...prev, student_id: selectedStudent.id }));
//     }
//   }, [selectedStudent]);
//   // Chargement initial (Élèves et Plans)
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [resStudents, resPlans] = await Promise.all([
//           Instance.get(`/api/students?club_id=${activeClubId}`),
//           Instance.get(`/api/pricing-plans?club_id=${activeClubId}`),
//         ]);
//         setStudents(resStudents.data?.students || []);
//         setPlans(resPlans.data);
//         console.log(resStudents.data);
//         console.log(resPlans.data);
//       } catch (err) {
//         console.error("Erreur de chargement", err);
//       }
//     };
//     fetchData();
//   }, [activeClubId]);

//   // Quand on choisit un plan, on remplit automatiquement le prix
//   const handlePlanChange = (planId) => {
//     const selectedPlan = plans.find((p) => p.id === planId);
//     setFormData({
//       ...formData,
//       pricing_plan_id: planId,
//       amount_paid: selectedPlan ? selectedPlan.price : "",
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       const res = await Instance.post("/api/payments", {
//         ...formData,
//         club_id: activeClubId,
//       });
//       console.log(res);
//       if (res.data.success) {
//         setSuccess("Paiement enregistré avec succès !");
//         // Reset du formulaire
//         setSelectedStudent(null);
//         setFormData({
//           ...formData,
//           student_id: "",
//           pricing_plan_id: "",
//           amount_paid: "",
//           starts_at: "",
//           notes: "",
//         });
//         setTimeout(() => setSuccess(""), 4000);
//       }
//     } catch (error) {
//       console.log(error);
//       ErrorGlobal({ error, setError });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Paper
//       sx={{
//         p: 4,
//         borderRadius: 4,
//         maxWidth: 800,
//         mx: "auto",
//         backgroundColor: "background.default",
//       }}
//     >
//       <Stack direction="row" alignItems="center" spacing={1} mb={3}>
//         <Receipt color="primary" />
//         <Typography variant="h5" fontWeight="700">
//           Nouvel Encaissement
//         </Typography>
//       </Stack>
//       <Box>
//         {success && <Message text={success} type="success" />}
//         {error.general && <Message text={error.general} type="error" />}
//       </Box>

//       <form onSubmit={handleSubmit}>
//         <StudentAutocomplete
//           activeClubId={activeClubId}
//           value={selectedStudent}
//           onChange={(val) => setSelectedStudent(val)}
//           hasError={hasError}
//           getError={getError}
//           label="Choisir un élève"
//         />
//         {/* Choix du Forfait */}
//         <TextField
//           error={hasError("pricing_plan_id")}
//           helperText={getError("pricing_plan_id")}
//           select
//           fullWidth
//           label="Type de Forfait"
//           required
//           value={formData.pricing_plan_id}
//           onChange={(e) => handlePlanChange(e.target.value)}
//           margin="normal"
//         >
//           {plans.map((plan) => (
//             <MenuItem key={plan.id} value={plan.id}>
//               {plan.label} ({plan.price} XOF)
//             </MenuItem>
//           ))}
//         </TextField>

//         {/* Montant (modifiable si besoin) */}
//         <TextField
//           error={hasError("amount_paid")}
//           helperText={getError("amount_paid")}
//           fullWidth
//           label="Montant encaissé"
//           type="number"
//           required
//           value={formData.amount_paid}
//           onChange={(e) =>
//             setFormData({ ...formData, amount_paid: e.target.value })
//           }
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">XOF</InputAdornment>
//             ),
//           }}
//           margin="normal"
//         />

//         {/* Mode de paiement */}
//         <TextField
//           error={hasError("payment_method")}
//           helperText={getError("payment_method")}
//           select
//           fullWidth
//           label="Mode de paiement"
//           value={formData.payment_method}
//           onChange={(e) =>
//             setFormData({ ...formData, payment_method: e.target.value })
//           }
//           margin="normal"
//         >
//           <MenuItem value="cash">Espèces</MenuItem>
//           <MenuItem value="check">Chèque</MenuItem>
//           <MenuItem value="card">Carte Bancaire</MenuItem>
//           <MenuItem value="transfer">Virement</MenuItem>
//         </TextField>

//         {/* Date de début */}
//         <TextField
//           error={hasError("starts_at")}
//           helperText={getError("starts_at")}
//           fullWidth
//           type="date"
//           label="Date d'effet"
//           value={formData.starts_at}
//           onChange={(e) =>
//             setFormData({ ...formData, starts_at: e.target.value })
//           }
//           InputLabelProps={{ shrink: true }}
//           margin="normal"
//         />

//         <TextField
//           error={hasError("notes")}
//           helperText={getError("notes")}
//           fullWidth
//           label="Notes / Commentaires"
//           multiline
//           rows={2}
//           value={formData.notes}
//           onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//           margin="normal"
//         />

//         <Divider sx={{ my: 1 }} />
//         <Button
//           type="submit"
//           variant="contained"
//           size="large"
//           fullWidth
//           disabled={loading}
//           startIcon={loading ? <CircularProgress size={20} /> : <Save />}
//           sx={{ py: 1.5, borderRadius: 2, fontWeight: "bold" }}
//         >
//           {loading ? "Enregistrement..." : "Enregistrer le paiement"}
//         </Button>
//       </form>
//     </Paper>
//   );
// };

// export default PaymentForm;

const PaymentForm = () => {
  const { activeClubId } = UseAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();

  const prefillData = location.state?.prefill;
  const [selectedStudent, setSelectedStudent] = useState(
    prefillData?.student || null,
  );
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    student_id: prefillData?.student?.id || "",
    pricing_plan_id: prefillData?.pricing_plan_id || "",
    amount_paid: prefillData?.amount_remaining || "",
    payment_method: "cash",
    starts_at: new Date().toISOString().split("T")[0],
    notes: prefillData ? "Règlement de reliquat" : "",
  });

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [debtInfo, setDebtInfo] = useState({ debt: 0, isNewPurchase: true });

  useEffect(() => {
    const fetchDebt = async () => {
      if (formData.student_id && formData.pricing_plan_id) {
        try {
          const res = await Instance.get(
            `/api/payments/students/${formData.student_id}/debt/${formData.pricing_plan_id}?club_id=${activeClubId}`,
          );
          setDebtInfo({
            debt: res.data.debt,
            isNewPurchase: res.data.is_new_purchase,
          });

          // Si c'est un remboursement de dette, on peut suggérer le montant restant par défaut
          if (!res.data.is_new_purchase) {
            setFormData((prev) => ({ ...prev, amount_paid: res.data.debt }));
          }
        } catch (err) {
          console.error("Erreur dette:", err);
        }
      }
    };
    fetchDebt();
  }, [formData.student_id, formData.pricing_plan_id]);

  const remainingAfterInput =
    debtInfo.debt - (parseFloat(formData.amount_paid) || 0);

  useEffect(() => {
    if (selectedStudent) {
      setFormData((prev) => ({ ...prev, student_id: selectedStudent.id }));
    }
  }, [selectedStudent]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPlans = await Instance.get(
          `/api/pricing-plans?club_id=${activeClubId}`,
        );
        setPlans(resPlans.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [activeClubId]);

  useEffect(() => {
    if (prefillData) {
      handlePlanChange(prefillData.pricing_plan_id);
    }
  }, [prefillData]);

  const handlePlanChange = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    setSelectedPlan(plan);
    setFormData({
      ...formData,
      pricing_plan_id: planId,
      amount_paid: plan ? plan.price : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await Instance.post("/api/payments", {
        ...formData,
        club_id: activeClubId,
      });
      if (res.data.success) {
        setSuccess(res.data.message || "Paiement enregistré avec succès !");
        if (location.state?.prefill) {
          window.history.replaceState({}, document.title);
        }
        setSelectedStudent(null);
        setSelectedPlan(null);
        setFormData({
          student_id: "",
          pricing_plan_id: "",
          amount_paid: "",
          payment_method: "cash",
          starts_at: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        maxWidth: 600,
        mx: "auto",
        boxShadow: 3,
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
      {/* afficher alert eleve a une dette de {debtInfo.debt} XOF pour ce forfait */}
      {!debtInfo.isNewPurchase && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cet élève a une dette de {debtInfo.debt.toLocaleString()} XOF pour ce
          forfait. Enregistrer un paiement ici réduira cette dette.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <StudentAutocomplete
          activeClubId={activeClubId}
          value={selectedStudent}
          onChange={(val) => setSelectedStudent(val)}
          hasError={hasError}
          getError={getError}
          label="Choisir un élève"
        />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Type de Forfait"
              required
              value={formData.pricing_plan_id}
              onChange={(e) => handlePlanChange(e.target.value)}
              error={hasError("pricing_plan_id")}
              helperText={getError("pricing_plan_id")}
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography>{plan.label}</Typography>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      fontWeight="bold"
                    >
                      {plan.price} XOF
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

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
            {/* INDICATEUR DE DETTE */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                height: "56px",
                display: "flex",
                alignItems: "center",
                bgcolor: remainingAfterInput > 0 ? "orange.50" : "grey.50",
                borderColor:
                  remainingAfterInput > 0 ? "orange.main" : "grey.300",
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Reste à payer
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={
                    remainingAfterInput > 0 ? "error.main" : "success.main"
                  }
                >
                  {remainingAfterInput.toLocaleString()} XOF
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Mode"
              value={formData.payment_method}
              onChange={(e) =>
                setFormData({ ...formData, payment_method: e.target.value })
              }
            >
              <MenuItem value="cash">Espèces</MenuItem>
              <MenuItem value="orange_money">Orange Money</MenuItem>
              <MenuItem value="moov_money">Moov Money</MenuItem>
              <MenuItem value="transfer">Virement</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
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
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#000",
                    bgcolor: "#f5f5f5",
                  },
                }}
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
          disabled={loading || !selectedStudent || !formData.pricing_plan_id}
          sx={{ mt: 3, py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Valider l'encaissement"
          )}
        </Button>
      </form>
    </Paper>
  );
};

export default PaymentForm;
