import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Input,
  OutlinedInput,
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../Api/AuthContext";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { activeClubId, auth } = UseAuth();
  console.log("Auth data:", auth, activeClubId);
  console.log("Auth data:", auth);
  const isSuperAdmin = auth?.roleSuperAdmin.includes("super_admin");

  const [plans, setPlans] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. Charger les plans et les clubs (si super_admin)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const plansRes = await Instance.get("/api/plans");
        setPlans(plansRes.data.plans || []);

        if (isSuperAdmin) {
          const clubsRes = await Instance.get("/api/clubs");
          console.log("Clubs fetched:", clubsRes);
          setClubs(clubsRes.data.clubs || []);
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isSuperAdmin]);

  // 2. Soumission du formulaire
  const handleSelectPlan = async (plan) => {
    const clubToSubmit = isSuperAdmin ? selectedClubId : activeClubId;

    if (!clubToSubmit) {
      setError({ general: "Vous devez sélectionner un club" });
      return;
    }
    console.log("clubToSubmit", clubToSubmit);
    try {
      setIsLoading(true);
      const dataSend = {
        plan_id: plan.id,
        club_id: clubToSubmit,
      };
      console.log("dataSend", dataSend);
      const response = await Instance.post("/api/subscriptions", dataSend);

      if (response.data.success) {
        setError("");
        if (response.data.redirect) {
          navigate(response.data.redirect);
          return;
        }
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(response.data.message || "Une erreur est survenue");
        setSuccess("");
      }
    } catch (error) {
      console.log(error);
      ErrorGlobal({ error, setError });
      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ py: 8 }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          S'abonner à un Plan
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
        {/* --- SECTION CHOIX DU CLUB (SUPER ADMIN UNIQUEMENT) --- */}
        {isSuperAdmin && (
          <Box sx={{ maxWidth: 400, mx: "auto", mb: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Sélectionner le club cible</InputLabel>
              <Select
                value={selectedClubId}
                label="Sélectionner le club cible"
                onChange={(e) => setSelectedClubId(e.target.value)}
              >
                {clubs.map((club) => (
                  <MenuItem key={club.id} value={club.id}>
                    {club.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {isLoading && plans.length === 0 ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ pb: 2 }}>
            {plans.map((plan) => (
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                  mx: "auto",
                  borderRadius: 2,
                }}
                minHeight={200}
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={plan.id}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    backgroundColor: "background.default",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      borderColor: "primary.main",
                    },
                    border: "2px solid transparent",
                  }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <Typography variant="h5" color="primary" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
                    {plan.description}
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 3 }}>
                    {plan.amount.split(".")[0]} FCFA
                  </Typography>
                  <Typography
                    variant="button"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    Choisir ce plan
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default SubscriptionPage;
