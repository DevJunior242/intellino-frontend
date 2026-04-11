import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TR,
  Paper,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import GavelIcon from "@mui/icons-material/Gavel";
import { Instance } from "../Api/Axios";
import Message from "../Saas/pages/Message";

export default function JuryManager() {
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Pour le loading sur un bouton précis
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});

  const [mandats, setMandats] = useState([]);
  const [jurys, setJurys] = useState([]);
  const [formData, setFormData] = useState({
    mandat_id: "",
    role_jury: "Membre",
  });

  // 1. Chargement initial (Mandats + Jurys existants)
  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const [resMandats, resJurys] = await Promise.all([
        Instance.get("/api/getMandats"),
        Instance.get("/api/jurys"), // Route pour voir tous les jurés
      ]);
      setMandats(resMandats.data || []);
      setJurys(resJurys.data || []);
    } catch (err) {
      console.error("Erreur de chargement", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Inscription (Self-Register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError({});
    try {
      const res = await Instance.post("/api/jurys/self-register", formData);
      setSuccess("Inscription réussie !");
      fetchData(); // On rafraîchit la liste immédiatement
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.errors || { general: "Erreur d'inscription" },
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Suppression d'un membre (Si erreur)
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce membre du jury ?")) return;
    setDeletingId(id);
    try {
      await Instance.delete(`/api/jurys/${id}`);
      setJurys((prev) => prev.filter((j) => j.id !== id));
      setSuccess("Membre retiré du jury.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  if (fetching)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, px: 2 }}>
      {/* SECTION FORMULAIRE */}
      <Card variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <GavelIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            S'inscrire comme Jury
          </Typography>
        </Stack>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Mandat"
              size="small"
              fullWidth
              value={formData.mandat_id}
              onChange={(e) =>
                setFormData({ ...formData, mandat_id: e.target.value })
              }
              required
            >
              {mandats.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  Mandat {m.start_at}-{m.end_at}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Rôle"
              size="small"
              fullWidth
              value={formData.role_jury}
              onChange={(e) =>
                setFormData({ ...formData, role_jury: e.target.value })
              }
            >
              <MenuItem value="Président">Président</MenuItem>
              <MenuItem value="Rapporteur">Rapporteur</MenuItem>
              <MenuItem value="Membre">Membre</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !formData.mandat_id}
              sx={{ minWidth: 150 }}
            >
              {submitting ? <CircularProgress size={20} /> : "S'inscrire"}
            </Button>
          </Stack>
        </form>
      </Card>

      {/* SECTION LISTE DES JURÉS */}
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
        Membres du Jury enregistrés
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TR>
              <TableCell>Nom & Prénom</TableCell>
              <TableCell>Mandat</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell align="right">Action</TableCell>
            </TR>
          </TableHead>
          <TableBody>
            {jurys.length > 0 ? (
              jurys.map((j) => (
                <TR key={j.id}>
                  <TableCell>
                    {j.user?.name} {j.user?.firstname}
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {j.user?.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {j.mandat?.start_at}-{j.mandat?.end_at}
                  </TableCell>
                  <TableCell>
                    <Chip label={j.role_jury} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(j.id)}
                      disabled={deletingId === j.id}
                    >
                      {deletingId === j.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                </TR>
              ))
            ) : (
              <TR>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  Aucun jury inscrit pour le moment.
                </TableCell>
              </TR>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
