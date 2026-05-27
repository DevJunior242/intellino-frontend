import { useState } from "react";
import { Instance } from "../../../../Api/Axios";

export default function PenaliteControl({ combat }) {
  const [sending, setSending] = useState(null);

  const envoyerPenalite = async (combattant) => {
    setSending(combattant);
    try {
      await Instance.post("/api/combat-penalite", {
        combat_id: combat.id,
        combattant,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(null);
    }
  };

  return (
    <Stack direction="row" gap={1}>
      <Button
        variant="outlined"
        disabled={!!sending}
        onClick={() => envoyerPenalite("aka")}
        sx={{
          flex: 1,
          borderColor: "#ef4444",
          color: "#ef4444",
          fontWeight: 700,
        }}
      >
        {sending === "aka" ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          "Pénalité AKA"
        )}
      </Button>
      <Button
        variant="outlined"
        disabled={!!sending}
        onClick={() => envoyerPenalite("ao")}
        sx={{
          flex: 1,
          borderColor: "#3b82f6",
          color: "#3b82f6",
          fontWeight: 700,
        }}
      >
        {sending === "ao" ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          "Pénalité AO"
        )}
      </Button>
    </Stack>
  );
}
