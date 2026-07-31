import { Box, Chip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import useCompetitionTheme from "./useCompetitionTheme";

// Couleurs des coins de combat (Aka rouge / Ao bleu) : identité fixe, indépendante du thème.
const CORNER = {
  aka: "#ef4444",
  ao: "#3b82f6",
};

export default function VainqueurOverlay({ combat, onClose }) {
  const T = useCompetitionTheme();
  const [visible, setVisible] = useState(false);
  const [vainqueurInfo, setVainqueurInfo] = useState(null);

  useEffect(() => {
    if (!combat?.vainqueur_id) {
      setVisible(false);
      return;
    }

    const estAka = combat.vainqueur_id === combat.inscription_aka_id;
    // Le capitaine d'une équipe Kata garde un athlete_id (contrainte BDD),
    // donc kata_team prime sur athlete ici.
    const nomInscription = (inscription) =>
      inscription?.kata_team?.nom ?? inscription?.athlete?.fullname;
    // Combat Kata (duel jugé au vote) : votes_aka/ao sont renseignés au lieu
    // de score_final_aka/ao (toujours 0 pour un combat Kata).
    const estKata = combat?.votes_aka !== null && combat?.votes_aka !== undefined;

    setVainqueurInfo({
      nom: estAka
        ? nomInscription(combat?.inscription_aka)
        : nomInscription(combat?.inscription_ao),
      club: estAka
        ? combat?.inscription_aka?.organisateur?.name
        : combat?.inscription_ao?.organisateur?.name,
      camp: estAka ? "AKA" : "AO",
      color: estAka ? CORNER.aka : CORNER.ao,
      colorLight: estAka ? alpha(CORNER.aka, 0.19) : alpha(CORNER.ao, 0.19),
      estKata,
      scoreAka: estKata ? (combat?.votes_aka ?? 0) : (combat?.score_final_aka ?? 0),
      scoreAo: estKata ? (combat?.votes_ao ?? 0) : (combat?.score_final_ao ?? 0),
      scoreLabel: estKata ? "Votes" : null,
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
            background: alpha(T.bg, 0.93),
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
                  color: T.textMuted,
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
                  color: T.text,
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
                  sx={{ color: T.textMuted, fontSize: "0.9rem", mb: 2 }}
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
              {vainqueurInfo.scoreLabel && (
                <Typography
                  sx={{
                    color: T.textMuted,
                    fontSize: "0.7rem",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  {vainqueurInfo.scoreLabel}
                </Typography>
              )}
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
                    color: CORNER.aka,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {vainqueurInfo.scoreAka}
                </Typography>
                <Typography
                  sx={{
                    color: T.textFaint,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  —
                </Typography>
                <Typography
                  sx={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    color: CORNER.ao,
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
                    bgcolor: alpha(T.warning, 0.13),
                    color: T.warning,
                    border: `1px solid ${alpha(T.warning, 0.25)}`,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              )}

              {/* Hint */}
              <Typography
                sx={{
                  color: T.textFaint,
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
