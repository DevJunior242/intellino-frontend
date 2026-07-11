import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Instance } from "../../../../Api/Axios";
import { getApiErrorMessage } from "../../Utils/handleApiError";
import { motion, AnimatePresence } from "framer-motion";
import { alpha } from "@mui/material/styles";
import useCompetitionTheme from "./useCompetitionTheme";

// Couleurs des coins de combat (Aka rouge / Ao bleu) : identité fixe, indépendante du thème.
const CORNER = { aka: "#ef4444", ao: "#3b82f6" };

export default function HanteiButton({
  combat,
  error,
  setError,
  config,
  success,
  setSuccess,
}) {
  const T = useCompetitionTheme();
  const [sending, setSending] = useState(null);

  if (parseInt(combat?.status) !== 3) return null;
  const envoyerHansoku = async (combattant) => {
    if (!combat?.id) return;
    setSending(combattant);
    setError({});
    setSuccess("");
    try {
      const jugeNumero = parseInt(localStorage.getItem("juge_numero")) || 1;
      const clientTimestamp = new Date().toISOString();

      const res = await Instance.post("/api/combat-actions", {
        combat_id: combat.id,
        juge_numero: jugeNumero,
        client_timestamp: clientTimestamp,

        combattant,
        type: "hantei",
        valeur: 0,
      });
      if (res.data?.message) setSuccess(res.data.message || "Hantei envoyé");
    } catch (err) {
      console.error(err);
      setError({ [config.id]: getApiErrorMessage(err) });
    } finally {
      setSending(null);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(T.warning, 0.25)}`,
        bgcolor: alpha(T.warning, 0.06),
        mb: 2,
      }}
    >
      <Typography
        sx={{
          color: T.warning,
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: 1,
          textAlign: "center",
          mb: 1.5,
        }}
      >
        HANTEI — DÉSIGNER LE VAINQUEUR
      </Typography>
      <Stack direction="row" gap={1}>
        <Button
          variant="contained"
          disabled={!!sending || combat?.vainqueur_id}
          onClick={() => envoyerHansoku("aka")}
          sx={{
            flex: 1,
            bgcolor: CORNER.aka,
            color: "#fff",
            fontWeight: 700,
            borderRadius: 2,
            "&:hover": { bgcolor: "#dc2626" },
            "&.Mui-disabled": { bgcolor: `${CORNER.aka}50` },
          }}
        >
          {sending === "aka" ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            `AKA — ${combat?.inscription_aka?.athlete?.fullname ?? "—"}`
          )}
        </Button>
        <Button
          variant="contained"
          disabled={!!sending || combat?.vainqueur_id}
          onClick={() => envoyerHansoku("ao")}
          sx={{
            flex: 1,
            bgcolor: CORNER.ao,
            color: "#fff",
            fontWeight: 700,
            borderRadius: 2,
            "&:hover": { bgcolor: "#2563eb" },
            "&.Mui-disabled": { bgcolor: `${CORNER.ao}50` },
          }}
        >
          {sending === "ao" ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            `AO — ${combat?.inscription_ao?.athlete?.fullname ?? "—"}`
          )}
        </Button>
      </Stack>

      {/* Erreurs / succès */}
      <AnimatePresence>
        {success[config.id] && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success[config.id]}
          </Alert>
        )}
        {error[config.id] && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error[config.id]}
          </Alert>
        )}
      </AnimatePresence>
    </Box>
  );
}
