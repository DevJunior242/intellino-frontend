import React from "react";
import { Box, Button, Container, Typography, Grid, Paper } from "@mui/material";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../Api/AuthContext";
function Subscription() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [plans, setPlan] = useState([]);
  const [selectPlan, setSelectPlan] = useState(null);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { activeClubId } = UseAuth();
  const getPlan = async () => {
    setIsLoading(true);
    try {
      const response = await Instance("/api/plans");
      console.log(response);
      setPlan(response.data.plans || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getPlan();
  }, []);

  const [formData, setFormData] = useState({
    plan_id: null,
  });
  //mettre a jour club_id

  //mettre a jour plan_id
  useEffect(() => {
    if (selectPlan) {
      setFormData((prev) => ({ ...prev, plan_id: selectPlan.id }));
    }
  }, [selectPlan]);

  const handleSubmit = async (plan) => {
    try {
      setSelectPlan(plan);
      const dataSend = {
        ...formData,
        club_id: activeClubId,
      };
      const response = await Instance.post("/api/subscriptions", dataSend);
      console.log(response);
      if (response.data.success) {
        if (response.data.redirect) {
          navigate(response.data.redirect);
          return;
        }
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);

        setFormData({
          plan_id: "",
        });
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
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 4,
        }}
      >
        <Box sx={{ py: 10, px: 2 }}>
          <Typography
            variant="h4"
            textAlign="center"
            sx={{ mb: 6, fontWeight: "bold", fontSize: { xs: 12, md: 24 } }}
          >
            choisissez votre plan
          </Typography>
          {success && <Message text={success} type="success" />}
          {error.general && <Message text={error.general} type="error" />}
          <Grid container spacing={2} sx={{ pb: 2 }}>
            {plans.map((plan, index) => (
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
                    cursor: "pointer",
                    textAlign: "center",
                    backgroundColor: "background.default",
                    border: selectPlan?.id === plan.id ? "2px solid" : "none",
                    borderRadius: 2,
                  }}
                  onClick={() => handleSubmit(plan)}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {plan?.name}
                  </Typography>
                  <Typography>{plan?.description}</Typography>
                  <Typography fontWeight={"bold"}>
                    {plan?.amount} FCFA
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default Subscription;
