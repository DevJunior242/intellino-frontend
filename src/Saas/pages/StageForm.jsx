import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";

export default function StageForm({ open, handleClose, onRefresh }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    price: 0,
    start_at: "",
    end_at: "",
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
    setSubmitting(true);

    try {
      const response = await Instance.post("/api/stages", formData);
      if (response?.data?.success) {
        setSuccess(response.data.message);
        setFormData({
          title: "",
          type: "",
          price: 0,
          start_at: "",
          end_at: "",
        });
      }
      await onRefresh();
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un stage</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {error && (
          <Message
            text={error.general}
            type="error"
            className="mb-4 text-center"
          />
        )}
        {success && (
          <Message text={success} type="success" className="mb-4 text-center" />
        )}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Titre du stage"
              error={hasError("title")}
              helperText={getError("title")}
              name="title"
              required
              fullWidth
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Stage d'arbitrage de début de saison"
            />
            {/* price */}
            <TextField
              label="Prix du stage"
              error={hasError("price")}
              helperText={getError("price")}
              name="price"
              required
              fullWidth
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Ex: 100"
            />

            <TextField
              label="Type de stage"
              error={hasError("type")}
              helperText={getError("type")}
              name="type"
              required
              fullWidth
              value={formData.type}
              onChange={handleChange}
              placeholder="Ex: Arbitrage, Technique, Kumite..."
            />

            <Box display="flex" gap={2}>
              <TextField
                label="Date et heure de début"
                error={hasError("start_at")}
                helperText={getError("start_at")}
                name="start_at"
                type="datetime-local"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.start_at}
                onChange={handleChange}
              />

              <TextField
                label="Date et heure de fin (Optionnelle)"
                error={hasError("end_at")}
                helperText={getError("end_at")}
                name="end_at"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.end_at}
                onChange={handleChange}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={submitting}
              sx={{ p: 1.5, fontWeight: "bold", textTransform: "none" }}
            >
              {submitting ? "Création..." : "Enregistrer le stage"}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
