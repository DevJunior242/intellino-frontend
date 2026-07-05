import { useState } from "react";
import { Button, CircularProgress, Stack } from "@mui/material";
import { Instance } from "../../../../Api/Axios";

export default function HansokuButton({ combat }) {
  const [sending, setSending] = useState(null);

  const envoyerHansoku = async (combattant) => {
    if (!combat?.id) return;
    setSending(combattant);
    try {
      const jugeNumero = parseInt(localStorage.getItem("juge_numero")) || 1;
      const clientTimestamp = new Date().toISOString();

      await Instance.post("/api/combat-actions", {
        combat_id: combat.id,
        juge_numero: jugeNumero,
        client_timestamp: clientTimestamp,

        combattant,
        type: "hansoku",
        valeur: 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(null);
    }
  };

  return (
    <Stack direction="row" gap={1} sx={{ mt: 2 }}>
      <Button
        variant="contained"
        disabled={!!sending || combat?.vainqueur_id}
        onClick={() => envoyerHansoku("aka")}
        sx={{
          flex: 1,
          bgcolor: "#7f1d1d",
          color: "#fff",
          fontWeight: 700,
          borderRadius: 2,
        }}
      >
        {sending === "aka" ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          "Hansoku AKA"
        )}
      </Button>
      <Button
        variant="contained"
        disabled={!!sending || combat?.vainqueur_id}
        onClick={() => envoyerHansoku("ao")}
        sx={{
          flex: 1,
          bgcolor: "#1e3a5f",
          color: "#fff",
          fontWeight: 700,
          borderRadius: 2,
        }}
      >
        {sending === "ao" ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          "Hansoku AO"
        )}
      </Button>
    </Stack>
  );
}
