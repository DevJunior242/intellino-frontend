import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

function AddclubManuel({ open, handleClose }) {
  const { activeId, activeType } = UseAuth();
  const [error, setError] = useState({});
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const dataSend = {
        ...formData,
        organisateur_id: activeId,
        organisateur_type: activeType,
      };
      const response = await Instance.post("/api/add/club", dataSend);
      console.log(response);

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
        setFormData({
          name: "",
          description: "",
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un club manuel</DialogTitle>
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
          <TextField
            error={!!hasError("name")}
            helperText={getError("name") ? getError("name").join(", ") : ""}
            id="name"
            name="name"
            label="nom complet"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            error={hasError("description")}
            helperText={
              getError("description") ? getError("description").join(", ") : ""
            }
            id="description"
            name="description"
            label="Commentaire général"
            multiline
            rows={3}
            fullWidth
            sx={{ mt: 2 }}
            value={formData.description}
            onChange={handleChange}
          />

          <Button
            disabled={submitting}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}
            disabled
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : (
              "ce button est désactivé pour le moment"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddclubManuel;
