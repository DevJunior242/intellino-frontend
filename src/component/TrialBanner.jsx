import React, { useEffect, useState } from "react";
import { Alert, AlertTitle } from "@mui/material";
import { Instance } from "../Api/Axios";
import { UseAuth } from "../Api/AuthContext";

const LABEL_ORG = {
  Club: "ce club",
  Ligue: "cette ligue",
  Federation: "cette fédération",
};

export default function TrialBanner() {
  const { activeId, activeType } = UseAuth();
  const [trial, setTrial] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!activeId || !activeType) return;

    Instance.get("/api/organisation")
      .then(({ data }) => {
        if (!cancelled) setTrial(data.trial || null);
      })
      .catch(() => {
        // Silencieux : une bannière d'essai ne doit jamais bloquer l'affichage du dashboard.
      });

    return () => {
      cancelled = true;
    };
  }, [activeId, activeType]);

  if (!trial || trial.activated) return null;

  const urgent = trial.days_remaining <= 3;
  const label = LABEL_ORG[activeType] || "votre organisation";

  return (
    <Alert severity={urgent ? "error" : "warning"} sx={{ mb: 2, borderRadius: 2 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>
        {trial.days_remaining > 0
          ? `Il vous reste ${trial.days_remaining} jour${trial.days_remaining > 1 ? "s" : ""}`
          : "Dernier jour"}
      </AlertTitle>
      Aucune clé d'activation n'a encore été renseignée pour {label} : passé ce
      délai, elle sera désactivée et plus aucune action n'y sera possible.
      Contactez le support pour l'activer.
    </Alert>
  );
}
