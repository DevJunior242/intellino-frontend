import React, { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  TextField,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

function CategoryForm({ open, handleClose }) {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const [formData, setFormData] = useState({
    nom: "",
    age_min: "",
    age_max: "",
    disciplines: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    try {
      console.log("FORM DATA", formData);
      const response = await Instance.post(
        "/api/categories/categories",
        formData,
      );
      console.log("RESPONSE", response);
      if (response.data.success) {
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          nom: "",
          age_min: "",
          age_max: "",
          disciplines: "",
        });
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajout d'une catégorie</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmit}>
          <TextField
            error={hasError("nom")}
            helperText={getError("nom")}
            type="text"
            name="nom"
            placeholder="ex:  Poussin, Benjamin, Minime, Cadet, Senior"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.nom}
            onChange={handleChange}
            required
          />
          {hasError("nom") && (
            <FormHelperText error>{getError("nom")}</FormHelperText>
          )}
          <TextField
            error={hasError("age_min")}
            helperText={getError("age_min")}
            type="number"
            name="age_min"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.age_min}
            onChange={handleChange}
            required
          />
          {hasError("age_min") && (
            <FormHelperText error>{getError("age_min")}</FormHelperText>
          )}

          <TextField
            error={hasError("age_max")}
            helperText={getError("age_max")}
            type="number"
            name="age_max"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.age_max}
            onChange={handleChange}
            required
          />
          {hasError("age_max") && (
            <FormHelperText error>{getError("age_max")}</FormHelperText>
          )}
          <TextField
            error={hasError("disciplines")}
            helperText={getError("disciplines")}
            type="text"
            name="disciplines"
            placeholder="Ex: Kata, Kumite, Kata_Kumite, Open"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.disciplines}
            onChange={handleChange}
            required
          />
          {/* {hasError("disciplines") && (
            <FormHelperText error>{getError("disciplines")}</FormHelperText>
          )} */}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            ajouter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryForm;
