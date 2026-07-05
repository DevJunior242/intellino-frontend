import { useEffect, useRef, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import { Box, Button, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

export default function ChronoCombat({ combat, canControl = false }) {
  const duree = (combat?.config_notation?.duration ?? 3) * 60; // en secondes
  const [tempsRestant, setTempsRestant] = useState(duree);
  const [actif, setActif] = useState(!!combat?.hajime_at && !combat?.yame_at);
  const intervalRef = useRef(null);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");

  // Calculer le temps restant depuis les données du combat
  useEffect(() => {
    if (!combat) return;
    const ecoule = combat.temps_ecoule ?? 0;

    if (combat.hajime_at && !combat.yame_at) {
      // Temps écoulé depuis le dernier HAJIME seulement
      const depuisHajime = dayjs().diff(dayjs(combat.hajime_at), "second");
      // ecoule = temps avant ce HAJIME
      // depuisHajime = temps depuis ce HAJIME
      const totalEcoule = ecoule + depuisHajime;
      setTempsRestant(Math.max(0, duree - totalEcoule));
    } else {
      // Chrono arrêté  affiche duree - ecoule
      setTempsRestant(Math.max(0, duree - ecoule));
    }
  }, [combat?.hajime_at, combat?.yame_at, combat?.temps_ecoule]);

  // Ticker

  useEffect(() => {
    setActif(!!combat?.hajime_at && !combat?.yame_at);
  }, [combat?.hajime_at, combat?.yame_at]);

  const estActif = actif;
  useEffect(() => {
    if (!estActif) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTempsRestant((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          Instance.post(`/api/combats/${combat.id}/stop-chrono`).catch(
            console.error,
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [estActif]);

  const formatTemps = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = async () => {
    setActif(true); // optimistic update
    clearInterval(intervalRef.current);
    setError({});
    setSuccess("");
    try {
      await Instance.post(`/api/combats/${combat.id}/start-chrono`);
    } catch (err) {
      console.error(err);
      setActif(false); //  rollback si erreur
      setError(
        err.response.data.message || "Erreur lors du démarrage du chrono",
      );
    }
  };

  const handleStop = async () => {
    setActif(false); // stop immédiat
    clearInterval(intervalRef.current);
    setError({});
    setSuccess("");
    try {
      await Instance.post(`/api/combats/${combat.id}/stop-chrono`);
    } catch (err) {
      console.error(err);
      setActif(true); //  rollback si erreur
      setError(err.response.data.message || "Erreur lors de l'arrêt du chrono");
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      {/* Chrono */}
      <Typography
        sx={{
          fontSize: { xs: "0.8rem", md: "1.2rem" },
          fontWeight: 900,
          color: tempsRestant <= 30 ? "#ef4444" : "#e2e8f0",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTemps(tempsRestant)}
      </Typography>

      {/* Boutons superviseur seulement */}
      {canControl && (
        <Stack direction="row" justifyContent="center" gap={2} mt={1}>
          <Button
            disabled={tempsRestant <= 0}
            variant="contained"
            onClick={estActif ? handleStop : handleStart}
            sx={{
              bgcolor: estActif ? "#ef4444" : "#22c55e",
              "&:hover": { bgcolor: estActif ? "#dc2626" : "#16a34a" },
              fontWeight: 700,
              px: 4,
            }}
          >
            {estActif ? "YAME" : "HAJIME"}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
