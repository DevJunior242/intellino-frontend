import React, { useEffect, useState } from "react";
import { Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Instance } from "../Api/Axios";
import { UseAuth } from "../Api/AuthContext";

export default function TierBanner() {
  const { activeId, activeType } = UseAuth();
  const navigate = useNavigate();
  const [palier, setPalier] = useState(null);

  useEffect(() => {
    if (!activeId || !activeType) return;
    Instance.get("/api/organisation")
      .then(({ data }) => setPalier(data.palier || null))
      .catch(() => {
        // Silencieux : cette bannière est informative, jamais bloquante.
      });
  }, [activeId, activeType]);

  if (!palier || !palier.niveau_alerte) return null;

  const severity = palier.niveau_alerte === "depasse" ? "error" : "warning";

  return (
    <Alert
      severity={severity}
      sx={{ mb: 2, borderRadius: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => navigate("/pricing")}
          sx={{ textTransform: "none", whiteSpace: "nowrap" }}
        >
          Voir les tarifs
        </Button>
      }
    >
      {palier.message}
    </Alert>
  );
}
