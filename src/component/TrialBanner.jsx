import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  TextField,
  Collapse,
} from "@mui/material";
import { Instance } from "../Api/Axios";
import { UseAuth } from "../Api/AuthContext";

const LABEL_ORG = {
  Club: "ce club",
  Ligue: "cette ligue",
  Federation: "cette fédération",
};

export default function TrialBanner() {
  const { activeId, activeType, activeRole } = UseAuth();
  const [trial, setTrial] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchTrial = useCallback(() => {
    if (!activeId || !activeType) return;
    Instance.get("/api/organisation")
      .then(({ data }) => setTrial(data.trial || null))
      .catch(() => {
        // Silencieux : une bannière d'essai ne doit jamais bloquer l'affichage du dashboard.
      });
  }, [activeId, activeType]);

  useEffect(() => {
    fetchTrial();
  }, [fetchTrial]);

  const handleActivate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await Instance.post("/api/organisation/activate", {
        activation_key: key,
      });
      setSuccess(true);
      setShowForm(false);
      setKey("");
      fetchTrial();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de valider cette clé d'activation.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
        Organisation activée avec succès.
      </Alert>
    );
  }

  if (!trial || trial.activated) return null;

  const urgent = trial.days_remaining <= 3;
  const label = LABEL_ORG[activeType] || "votre organisation";
  const isAdmin = activeRole === "admin";

  return (
    <Alert severity={urgent ? "error" : "warning"} sx={{ mb: 2, borderRadius: 2 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>
        {trial.days_remaining > 0
          ? `Il vous reste ${trial.days_remaining} jour${trial.days_remaining > 1 ? "s" : ""}`
          : "Dernier jour"}
      </AlertTitle>
      Aucune clé d'activation n'a encore été renseignée pour {label} : passé ce
      délai, elle sera désactivée et plus aucune action n'y sera possible.
      {isAdmin ? (
        <>
          {" "}
          Si vous en avez reçu une, entrez-la ci-dessous.
          <Box sx={{ mt: 1.5 }}>
            {!showForm ? (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => setShowForm(true)}
                sx={{ textTransform: "none" }}
              >
                Entrer ma clé d'activation
              </Button>
            ) : (
              <Collapse in={showForm}>
                <Box
                  component="form"
                  onSubmit={handleActivate}
                  sx={{ display: "flex", gap: 1, alignItems: "flex-start", flexWrap: "wrap" }}
                >
                  <TextField
                    size="small"
                    autoFocus
                    placeholder="Ex: LIGUE-2026-XXXX-XXXX"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    error={!!error}
                    helperText={error}
                    sx={{ minWidth: 240 }}
                  />
                  <Button
                    type="submit"
                    size="small"
                    variant="contained"
                    disabled={submitting || !key.trim()}
                    sx={{ textTransform: "none" }}
                  >
                    {submitting ? "Vérification..." : "Valider"}
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    Annuler
                  </Button>
                </Box>
              </Collapse>
            )}
          </Box>
        </>
      ) : (
        " Contactez l'administrateur pour l'activer."
      )}
    </Alert>
  );
}
