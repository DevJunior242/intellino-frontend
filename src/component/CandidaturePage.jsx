import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Instance } from "../Api/Axios";
import ErrorGlobal from "./ErrorGlobal";
import Message from "../Saas/pages/Message";

export default function CandidaturePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const [formData, setFormData] = useState({
    mandat_id: "",
    poste_id: "",
  });
  const [data, setData] = useState({
    postes: [],
    mandats: [],
    loading: true,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const [resPostes, resMandats] = await Promise.all([
        Instance.get("/api/getPostes"),
        Instance.get("/api/getMandats"),
      ]);
      console.log("resPostes", resPostes.data);
      console.log("resMandats", resMandats.data);
      setData({
        postes: resPostes.data || [],
        mandats: resMandats.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Erreur de chargement", error);
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mandat_id || !formData.poste_id) {
      return;
    }

    setLoading(true);
    setError({});
    setSuccess("");
    try {
      const res = await Instance.post("/api/candidatures", formData);
      console.log(res);
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => setSuccess(""), 4000);
      }
      setFormData({ ...formData, poste_id: "" }); // On reset le poste mais on garde le mandat
    } catch (err) {
      console.error(err);
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  };
  if (data.loading) return <CircularProgress />;

  return (
    <Card variant="outlined" sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <PersonAddIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h5" fontWeight="bold">
          Déposer une Candidature
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inscrivez-vous pour un poste au sein du bureau
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
      </Box>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Sélection du Mandat */}
          <TextField
            error={hasError("mandat_id")}
            helperText={getError("mandat_id")}
            select
            label="Mandat Concerné"
            value={formData.mandat_id}
            onChange={(e) =>
              setFormData({ ...formData, mandat_id: e.target.value })
            }
            fullWidth
          >
            {data?.mandats?.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                ({m.start_at} - {m.end_at}) {m.actif ? "(Actuel)" : ""}
              </MenuItem>
            ))}
          </TextField>

          {/* Sélection du Poste */}
          <TextField
            error={hasError("poste_id")}
            helperText={getError("poste_id")}
            select
            label="Poste Convoité"
            value={formData.poste_id}
            onChange={(e) =>
              setFormData({ ...formData, poste_id: e.target.value })
            }
            fullWidth
            disabled={!formData.mandat_id}
          >
            {data?.postes?.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.title} {p.parent_id ? "(Adjoint)" : "(Titulaire)"}
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontWeight: "bold" }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              "Confirmer ma Candidature"
            )}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
