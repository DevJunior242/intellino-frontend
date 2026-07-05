import { Box, Chip, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function VainqueurOverlay({ combat, onClose }) {
  const [visible, setVisible] = useState(false);
  const [vainqueurInfo, setVainqueurInfo] = useState(null);

  useEffect(() => {
    if (!combat?.vainqueur_id) {
      setVisible(false);
      return;
    }

    const estAka = combat.vainqueur_id === combat.inscription_aka_id;

    setVainqueurInfo({
      nom: estAka
        ? combat?.inscription_aka?.athlete?.fullname
        : combat?.inscription_ao?.athlete?.fullname,
      club: estAka
        ? combat?.inscription_aka?.organisateur?.name
        : combat?.inscription_ao?.organisateur?.name,
      camp: estAka ? "AKA" : "AO",
      color: estAka ? "#ef4444" : "#3b82f6",
      colorLight: estAka ? "#ef444430" : "#3b82f630",
      scoreAka: combat?.score_final_aka ?? 0,
      scoreAo: combat?.score_final_ao ?? 0,
      typeVictoire: combat?.type_victoire ?? null,
    });

    setVisible(true);

    // const timer = setTimeout(() => {
    //   setVisible(false);
    //   onClose?.();
    // }, 5000);

    // return () => clearTimeout(timer);
  }, [combat?.vainqueur_id]);

  const labelVictoire = (type) => {
    switch (type) {
      case "hansoku":
        return "Hansoku";
      case "kiken":
        return "Kiken";
      case "hantei":
        return "Hantei";
      default:
        return "Points";
    }
  };

  return (
    <AnimatePresence>
      {visible && vainqueurInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 26, 0.93)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
            mt: 2,
          }}
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Box sx={{ textAlign: "center", px: 4 }}>
              {/* Label vainqueur */}
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.75rem",
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                Vainqueur
              </Typography>

              {/* Nom */}
              <Typography
                sx={{
                  color: "#ffffff",
                  fontSize: { xs: "1.8rem", sm: "2.8rem" },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 1,
                }}
              >
                {vainqueurInfo.nom ?? "—"}
              </Typography>

              {/* Club */}
              {vainqueurInfo.club && (
                <Typography
                  sx={{ color: "#64748b", fontSize: "0.9rem", mb: 2 }}
                >
                  {vainqueurInfo.club}
                </Typography>
              )}

              {/* Camp AKA/AO */}
              <Chip
                label={vainqueurInfo.camp}
                sx={{
                  bgcolor: vainqueurInfo.colorLight,
                  color: vainqueurInfo.color,
                  border: `1px solid ${vainqueurInfo.color}40`,
                  fontWeight: 900,
                  fontSize: "1rem",
                  px: 2,
                  mb: 3,
                }}
              />

              {/* Score final */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    color: "#ef4444",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {vainqueurInfo.scoreAka}
                </Typography>
                <Typography
                  sx={{ color: "#1e2a3a", fontSize: "1.5rem", fontWeight: 700 }}
                >
                  —
                </Typography>
                <Typography
                  sx={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    color: "#3b82f6",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {vainqueurInfo.scoreAo}
                </Typography>
              </Box>

              {/* Type de victoire */}
              {vainqueurInfo.typeVictoire && (
                <Chip
                  label={labelVictoire(vainqueurInfo.typeVictoire)}
                  size="small"
                  sx={{
                    bgcolor: "#f59e0b20",
                    color: "#f59e0b",
                    border: "1px solid #f59e0b40",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              )}

              {/* Hint */}
              <Typography
                sx={{
                  color: "#1e2a3a",
                  fontSize: "0.65rem",
                  mt: 4,
                  letterSpacing: 1,
                }}
              >
                Appuyer pour continuer
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
