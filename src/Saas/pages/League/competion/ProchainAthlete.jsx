import { motion, AnimatePresence } from "framer-motion";
import { Paper, Typography, Stack, Chip, Box } from "@mui/material";
import { AccessTime, Person, SportsMartialArts } from "@mui/icons-material";

/**
 * ProchainAthlete — composant réutilisable
 *
 * Props :
 * @param {object}  nextAthlete        — objet OrdrePassage avec inscription chargée
 * @param {boolean} compact            — version réduite pour juge/superviseur (défaut false)
 * @param {string}  className          — classe CSS optionnelle
 */
export default function ProchainAthlete({ nextAthlete, compact = false }) {
  return (
    <AnimatePresence mode="wait">
      {nextAthlete && (
        <motion.div
          key={nextAthlete.id}
          initial={{ opacity: 0, y: compact ? 10 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: compact ? -10 : -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Paper
            elevation={0}
            sx={{
              p: compact ? 2 : 3,
              mb: compact ? 1.5 : 3,
              borderRadius: 4,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              background: `linear-gradient(135deg, #001a1a 0%, #002222 25%, #003333 60%, #004444 100%)`,
              border: "1px solid rgba(0, 180, 216, 0.45)",
              boxShadow: compact
                ? "0 0 8px rgba(0, 180, 216, 0.12)"
                : "0 0 12px rgba(0, 180, 216, 0.18), 0 8px 30px rgba(0,0,0,0.75)",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: `linear-gradient(120deg, transparent 20%, rgba(0, 216, 255, 0.08) 50%, transparent 80%)`,
                pointerEvents: "none",
              },
            }}
          >
            {/* Particules déco — seulement en mode large */}
            {!compact && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: "absolute",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: "#00d4ff",
                      top: `${20 + i * 25}%`,
                      left: `${5 + i * 10}%`,
                      opacity: 0.3,
                    }}
                    animate={{
                      opacity: [0.1, 0.5, 0.1],
                      scale: [1, 1.5, 1],
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </>
            )}

            {/* Label pulsant */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={0.5}
                mb={compact ? 0.5 : 1}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#00b4d8",
                    animation: "none",
                  }}
                  component={motion.div}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#00b4d8",
                    fontWeight: "bold",
                    letterSpacing: 2,
                    fontSize: compact ? "0.6rem" : "0.7rem",
                  }}
                >
                  PROCHAIN ATHLÈTE
                </Typography>
              </Stack>
            </motion.div>

            {/* Nom */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Typography
                variant={compact ? "h6" : "h3"}
                fontWeight="900"
                sx={{ color: "#00d4ff", lineHeight: 1.2, mb: 1 }}
              >
                {nextAthlete?.inscription?.athlete?.fullname ?? "—"}
              </Typography>
            </motion.div>

            {/* Infos */}
            <Stack
              direction={compact ? "row" : "column"}
              alignItems="center"
              justifyContent="center"
              gap={compact ? 1 : 0.5}
              flexWrap="wrap"
            >
              {/* Club / Organisateur */}
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Person sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: compact ? "0.7rem" : "0.82rem",
                  }}
                >
                  {nextAthlete?.inscription?.organisateur?.name ?? "—"}
                </Typography>
              </Stack>

              {!compact && (
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                />
              )}

              {/* Passage */}
              <Stack direction="row" alignItems="center" gap={0.5}>
                <AccessTime
                  sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: compact ? "0.7rem" : "0.82rem",
                  }}
                >
                  Passage N°{nextAthlete?.ordre ?? "—"}
                </Typography>
              </Stack>

              {/* Kata */}
              {nextAthlete?.inscription?.kata && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <SportsMartialArts
                    sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: compact ? "0.7rem" : "0.82rem",
                    }}
                  >
                    {nextAthlete.inscription.kata ??
                      nextAthlete.inscription.kata}
                  </Typography>
                </Stack>
              )}

              {/* Catégorie */}
              {nextAthlete?.inscription?.competition?.category && (
                <Chip
                  label={`${nextAthlete.inscription.competition.category.nom} · ${nextAthlete.inscription.competition.category.sexe}`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(0,180,216,0.12)",
                    color: "#00b4d8",
                    border: "1px solid rgba(0,180,216,0.25)",
                    fontSize: compact ? "0.6rem" : "0.7rem",
                    height: compact ? 18 : 22,
                  }}
                />
              )}
            </Stack>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
