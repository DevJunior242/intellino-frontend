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
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import { Instance } from "../Api/Axios";
import Message from "../Saas/pages/Message";
import ErrorGlobal from "./ErrorGlobal";

export default function JurySelfRegistration() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});

  const [formData, setFormData] = useState({
    mandat_id: "",
    role_jury: "Membre",
    organisateur_id: "",
    organisateur_type: "Ligue", // Par défaut
  });

  const [options, setOptions] = useState({
    mandats: [],
    ligues: [],
    federations: [],
  });

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const [resMandats, resLigues, resFedes] = await Promise.all([
        Instance.get("/api/getMandats"),
        Instance.get("/api/leagues/leagues"),
        Instance.get("/api/federations/federations"),
      ]);
      console.log(resMandats.data);
      console.log(resLigues.data);
      console.log(resFedes.data);

      setOptions({
        mandats: resMandats.data || [],
        ligues: resLigues.data || [],
        federations: resFedes.data || [],
      });
    } catch (err) {
      console.error("Erreur de récupération des données", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({});
    setSuccess("");

    try {
      const res = await Instance.post("/api/jurys", formData);

      setSuccess("Vous êtes maintenant inscrit comme membre du Jury !");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error(err);
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Card variant="outlined" sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <GavelIcon color="secondary" sx={{ fontSize: 40 }} />
        <Typography variant="h5" fontWeight="bold">
          Inscription au Jury
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enregistrez-vous pour superviser l'élection en cours
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            select
            label="Sélectionner le Mandat"
            value={formData.mandat_id}
            onChange={(e) =>
              setFormData({ ...formData, mandat_id: e.target.value })
            }
            fullWidth
            required
          >
            {options.mandats.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                Mandat {m.start_at} - {m.end_at} {m.actif ? "(Actuel)" : ""}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Votre rôle dans le Jury"
            value={formData.role_jury}
            onChange={(e) =>
              setFormData({ ...formData, role_jury: e.target.value })
            }
            fullWidth
          >
            <MenuItem value="Président">Président du Jury</MenuItem>
            <MenuItem value="Rapporteur">Rapporteur</MenuItem>
            <MenuItem value="Membre">Membre Assesseur</MenuItem>
          </TextField>
          {/* 1. Choix du TYPE (Ligue ou Fédé) */}
          <TextField
            select
            label="Type d'organisation"
            value={formData.organisateur_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                organisateur_type: e.target.value,
                organisateur_id: "", // Reset l'ID quand on change de type
              })
            }
            fullWidth
          >
            <MenuItem value="Ligue">Ligue Régionale</MenuItem>
            <MenuItem value="Federation">Fédération Nationale</MenuItem>
          </TextField>

          {/* 2. Choix de l'entité PRÉCISE (Ton code existant mis à jour) */}
          <TextField
            select
            label={
              formData.organisateur_type === "Ligue"
                ? "Choisir la Ligue"
                : "Choisir la Fédération"
            }
            value={formData.organisateur_id}
            onChange={(e) =>
              setFormData({ ...formData, organisateur_id: e.target.value })
            }
            required
            fullWidth
            disabled={
              formData.organisateur_type === "Ligue"
                ? options.ligues.length === 0
                : options.federations.length === 0
            }
          >
            {formData.organisateur_type === "Ligue"
              ? options.ligues.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.name}
                  </MenuItem>
                ))
              : options.federations.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.nom_fede}
                  </MenuItem>
                ))}
          </TextField>
          {/* Un petit champ de sécurité pour éviter que n'importe qui s'inscrive */}
          <TextField
            label="Code d'accréditation"
            placeholder="Code fourni par la Fédération"
            value={formData.code_accreditation}
            onChange={(e) =>
              setFormData({ ...formData, code_accreditation: e.target.value })
            }
            fullWidth
            helperText="Seuls les membres officiels possèdent ce code."
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={loading || !formData.mandat_id}
            fullWidth
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              "Valider mon inscription"
            )}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
