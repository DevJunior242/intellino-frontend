import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@mui/material";
import { Business, PhotoCamera, Save } from "@mui/icons-material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ErrorGlobal from "../ErrorGlobal";
import Message from "../../Saas/pages/Message";

const LANGUES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

const DEVISES = [
  { value: "XOF", label: "XOF" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
];

const LABEL_ORG = {
  Club: "du club",
  Ligue: "de la ligue",
  Federation: "de la fédération",
};

function OrganisationSettings() {
  const { activeType } = UseAuth();
  const fileInputRef = useRef(null);

  const [org, setOrg] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const fetchOrg = useCallback(async () => {
    setLoading(true);
    setError({});
    try {
      const { data } = await Instance.get("/api/organisation");
      setOrg(data.data);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  const handleChange = (field) => (e) => {
    setOrg((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError({});
    setSuccess("");
    try {
      const formData = new FormData();
      const excluded = ["id", "logo", "logo_url", "created_at", "updated_at", "deleted_at"];
      Object.entries(org || {}).forEach(([key, value]) => {
        if (excluded.includes(key)) return;
        if (value !== null && value !== undefined) formData.append(key, value);
      });
      if (logoFile) formData.append("logo", logoFile);

      const { data } = await Instance.post("/api/organisation", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOrg(data.data);
      setLogoFile(null);
      setLogoPreview(null);
      setSuccess(data.message || "Informations mises à jour.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!org) {
    return <Message text="Impossible de charger les informations de l'organisation." type="error" />;
  }

  const logoUrl = logoPreview || org.logo_url || null;

  return (
    <Paper sx={{ width: "100%", p: 3, backgroundColor: "background.default" }}>
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Business /> Organisation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Informations {LABEL_ORG[activeType] || "de l'organisation"} — visibles par vos membres.
      </Typography>

      {success && <Message text={success} type="success" />}
      {error?.general && <Message text={error.general} type="error" />}

      <form onSubmit={handleSubmit}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar src={logoUrl} sx={{ width: 72, height: 72 }}>
            <Business />
          </Avatar>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoCamera />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ textTransform: "none" }}
          >
            Changer le logo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleLogoPick}
          />
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom"
              value={org.name || ""}
              onChange={handleChange("name")}
              error={hasError("name")}
              helperText={getError("name")}
              required
            />
          </Grid>

          {activeType === "Club" && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ville"
                value={org.city || ""}
                onChange={handleChange("city")}
                error={hasError("city")}
                helperText={getError("city")}
              />
            </Grid>
          )}

          {(activeType === "Club" || activeType === "Ligue") && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Région"
                value={org.region || ""}
                onChange={handleChange("region")}
                error={hasError("region")}
                helperText={getError("region")}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Adresse"
              value={org.address || ""}
              onChange={handleChange("address")}
              error={hasError("address")}
              helperText={getError("address")}
            />
          </Grid>

          {activeType === "Federation" && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={org.phone || ""}
                  onChange={handleChange("phone")}
                  error={hasError("phone")}
                  helperText={getError("phone")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={org.email || ""}
                  onChange={handleChange("email")}
                  error={hasError("email")}
                  helperText={getError("email")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site web"
                  value={org.website || ""}
                  onChange={handleChange("website")}
                  error={hasError("website")}
                  helperText={getError("website")}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Langue
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={org.langue || "fr"}
              onChange={(e, value) => value && setOrg((prev) => ({ ...prev, langue: value }))}
            >
              {LANGUES.map((l) => (
                <ToggleButton key={l.value} value={l.value} sx={{ textTransform: "none" }}>
                  {l.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Devise
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={org.devise || "XOF"}
              onChange={(e, value) => value && setOrg((prev) => ({ ...prev, devise: value }))}
            >
              {DEVISES.map((d) => (
                <ToggleButton key={d.value} value={d.value} sx={{ textTransform: "none" }}>
                  {d.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          La langue et la devise sont enregistrées pour préparer une future personnalisation ;
          le reste de l'application affiche pour l'instant le français et le XOF partout.
        </Alert>

        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
          disabled={saving}
          sx={{ mt: 3 }}
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Paper>
  );
}

export default OrganisationSettings;
