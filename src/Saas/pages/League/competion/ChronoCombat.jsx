import { useEffect, useRef, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import { Box, Button, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

export default function ChronoCombat({ combat, canControl = false }) {
  const duree = (combat?.config_notation?.duration ?? 3) * 60; // en secondes
  const [tempsRestant, setTempsRestant] = useState(duree);
  const [actif, setActif] = useState(false);
  const intervalRef = useRef(null);

  // Calculer le temps restant depuis les données du combat
  useEffect(() => {
    if (!combat) return;

    const ecoule = combat.temps_ecoule ?? 0;
    setTempsRestant(duree - ecoule);

    // Si hajime_at et pas de yame_at → chrono tourne
    if (combat.hajime_at && !combat.yame_at) {
      const depuisHajime = dayjs().diff(dayjs(combat.hajime_at), "second");
      const restant = duree - ecoule - depuisHajime;
      setTempsRestant(Math.max(0, restant));
      setActif(true);
    } else {
      setActif(false);
    }
  }, [combat]);

  // Ticker
  useEffect(() => {
    if (actif) {
      intervalRef.current = setInterval(() => {
        setTempsRestant((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setActif(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [actif]);

  const formatTemps = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = async () => {
    await Instance.post(`/api/combats/${combat.id}/start-chrono`);
  };

  const handleStop = async () => {
    await Instance.post(`/api/combats/${combat.id}/stop-chrono`);
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
            variant="contained"
            onClick={actif ? handleStop : handleStart}
            sx={{
              bgcolor: actif ? "#ef4444" : "#22c55e",
              "&:hover": { bgcolor: actif ? "#dc2626" : "#16a34a" },
              fontWeight: 700,
              px: 4,
            }}
          >
            {actif ? "YAME" : "HAJIME"}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
