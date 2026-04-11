import React, { useState } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Stack,
  Card,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

export default function CreatePosteForm({ existingPostes, onPosteCreated }) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [formData, setFormData] = useState({
    title: "",
    parent_id: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");

    try {
      const res = await Instance.post("/api/postes", formData);
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => setSuccess(""), 5000);
      }
      setFormData({ title: "", parent_id: null });
      if (onPosteCreated) onPosteCreated();
    } catch (error) {
      console.error("Erreur creation poste", error);
      ErrorGlobal({ error, setError });
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 2,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
        }}
      >
        <AddCircleIcon sx={{ mr: 1, color: "primary.main" }} />
        Nouveau Poste Officiel
      </Typography>
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Titre du Poste */}
          <TextField
            error={hasError("title")}
            helperText={getError("title")}
            label="Nom du Poste (ex: Secrétaire Général)"
            variant="outlined"
            fullWidth
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Entrez le titre officiel..."
            margin="normal"
            required
          />

          {/* Sélection du Parent (Hiérarchie) */}
          <Autocomplete
            options={existingPostes.filter((p) => !p.parent_id)} // On ne liste que les titulaires pour éviter les sous-adjoints
            getOptionLabel={(option) => option.title}
            value={
              existingPostes.find((p) => p.id === formData.parent_id) || null
            }
            onChange={(event, newValue) => {
              setFormData({
                ...formData,
                parent_id: newValue ? newValue.id : null,
              });
            }}
            renderInput={(params) => (
              <TextField
                error={hasError("parent_id")}
                formHelperText={getError("parent_id")}
                {...params}
                label="Rattaché à (Laisser vide si Titulaire)"
                helperText={
                  formData.parent_id
                    ? "Ce poste sera enregistré comme Adjoint"
                    : "Ce poste sera un Titulaire principal"
                }
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountTreeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!formData.title}
            sx={{ py: 1.5, fontWeight: "bold" }}
          >
            Enregistrer le Poste
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
