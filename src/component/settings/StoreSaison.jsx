import React from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../ErrorGlobal";
import Message from "../../Saas/pages/Message";

function StoreSaison() {
  const { activeId, activeType } = UseAuth();
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [submitting, setSubmitting] = useState(false);
  // — Saison state
  const [saison, setSaison] = useState({
    libelle: "",
    dateDebut: "",
    dateFin: "",
    active: true,
  });

  const handleChange = (e) => {
    setSaison({ ...saison, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const dataSend = {
        ...saison,
        organisateur_id: activeId,
        organisateur_type: activeType,
      };

      const response = await Instance.post("/api/saisons", dataSend);
      console.log(response);

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
        setSaison({
          libelle: "",
          dateDebut: "",
          dateFin: "",
          active: true,
        });
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Container maxWidth="xs">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 8,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h4" component={"h1"} textAlign={"center"}>
          configurer la saison
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <TextField
            error={hasError("libelle")}
            helperText={getError("libelle")}
            name="libelle"
            label="Libellé de la saison(ex: 2024-2025)"
            variant="outlined"
            fullWidth
            value={saison.libelle}
            onChange={handleChange}
            required
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              error={hasError("dateDebut")}
              helperText={getError("dateDebut")}
              type="date"
              name="dateDebut"
              variant="outlined"
              fullWidth
              margin="normal"
              value={saison.dateDebut}
              onChange={handleChange}
              required
            />

            <TextField
              error={hasError("dateFin")}
              helperText={getError("dateFin")}
              type="date"
              name="dateFin"
              variant="outlined"
              fullWidth
              margin="normal"
              value={saison.dateFin}
              onChange={handleChange}
              required
            />
          </Box>
          <Button
            disabled={submitting}
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              textTransform: "none",
              fontSize: { xs: 8, md: 14 },
              bgcolor: "primary.main",
            }}
          >
            {submitting ? "Enregistrement en cours..." : "definir la saison"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default StoreSaison;
