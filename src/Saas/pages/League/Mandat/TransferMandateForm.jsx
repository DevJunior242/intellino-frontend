import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { motion } from "framer-motion";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import { Instance } from "../../../../Api/Axios";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import Message from "../../Message";
import { UseAuth } from "../../../../Api/AuthContext";

export default function TransferMandateForm() {
  const { activeId, activeType } = UseAuth();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    mandate_end_at: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");

    if (
      !window.confirm(
        "Attention : Cette action va révoquer définitivement vos accès administrateur au profit du successeur dès sa validation. Confirmez-vous ?",
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const dataSend = {
        ...formData,
        organisateur_id: activeId,
        organisateur_type: activeType,
      };
      const response = await Instance.post(
        "/api/mandat/transfer-mandate",
        dataSend,
      );
      if (response?.data?.success) {
        setSuccess(response.data.message);
        setFormData({ email: "", mandate_end_at: "" });
        // Optionnel : Forcer la déconnexion ou la redirection ici
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: 4,
        borderRadius: 2,
        boxShadow: 4,
        backgroundColor: "background.default",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <ForwardToInboxIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Transmettre le Mandat (Voie Amiable)
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Utilisez ce formulaire pour céder la gestion de la ligue au nouveau
        président élu. Un email lui sera envoyé pour configurer son compte et
        prendre les rênes de l'espace.
      </Typography>

      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}

      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            error={hasError("email")}
            helperText={getError("email")}
            label="Email du nouveau président"
            name="email"
            type="email"
            required
            fullWidth
            value={formData.email}
            onChange={handleChange}
            placeholder="exemple@federation.com"
          />
          <TextField
            error={hasError("phone")}
            helperText={getError("phone")}
            label="Numéro de téléphone du nouveau président"
            name="phone"
            type="tel"
            required
            fullWidth
            value={formData.phone}
            onChange={handleChange}
            placeholder="0612345678"
          />

          <TextField
            error={hasError("mandate_end_at")}
            helperText={getError("mandate_end_at")}
            label="Date de fin du nouveau mandat"
            name="mandate_end_at"
            type="date"
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.mandate_end_at}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={submitting}
            sx={{ p: 1.5, textTransform: "none", fontWeight: "bold" }}
          >
            {submitting
              ? "Transfert en cours..."
              : "Transmettre officiellement les accès"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
