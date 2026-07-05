import { useCallback, useEffect, useRef, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { EmojiEvents, MilitaryTech } from "@mui/icons-material";
import { motion } from "framer-motion";

const C = {
  bg: "#080d14",
  card: "#0f1623",
  border: "#1e2a3a",
  text: "#e2e8f0",
  muted: "#64748b",
  aka: "#ef4444",
  ao: "#3b82f6",
  gold: "#f59e0b",
  silver: "#94a3b8",
  bronze: "#d97706",
  green: "#22c55e",
  winner: "#00e5c0",
};

const ETAPE_ORDER = ["Quart-finale", "Demi-finale", "Finale"];

function nom(inscription) {
  return inscription?.athlete?.fullname ?? "—";
}

function typeVictoireLabel(type) {
  switch (type) {
    case "hansoku":
      return "H";
    case "hantei":
      return "J";
    case "kiken":
      return "K";
    default:
      return "";
  }
}

// ── Carte d'un combat ──────────────────────────────────────────────────────
function CombatCard({ combat, isWide = true }) {
  if (!combat)
    return (
      <Box
        sx={{
          width: isWide ? 180 : 140,
          height: 70,
          border: `1px dashed ${C.border}`,
          borderRadius: 2,
          bgcolor: C.card,
        }}
      />
    );

  const akaWon = combat.vainqueur_id === combat.inscription_aka_id;
  const aoWon = combat.vainqueur_id === combat.inscription_ao_id;
  const enCours = combat.status === 1;
  const termine = combat.status === 2;

  const rowStyle = (won, color) => ({
    px: 1.2,
    py: 0.6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    bgcolor: won ? `${color}15` : "transparent",
    borderLeft: won ? `2px solid ${color}` : "2px solid transparent",
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          width: isWide ? 180 : 140,
          border: `1px solid ${enCours ? C.winner : C.border}`,
          borderRadius: 2,
          bgcolor: C.card,
          overflow: "hidden",
          boxShadow: enCours ? `0 0 12px ${C.winner}30` : "none",
        }}
      >
        {/* AKA */}
        <Box sx={rowStyle(akaWon, C.aka)}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: akaWon ? C.text : C.muted,
              fontWeight: akaWon ? 700 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: isWide ? 120 : 85,
            }}
          >
            {nom(combat.inscription_aka)}
          </Typography>
          <Stack direction="row" alignItems="center" gap={0.4}>
            {termine && (
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: akaWon ? C.aka : C.muted,
                  fontWeight: 700,
                }}
              >
                {combat.score_final_aka}
              </Typography>
            )}
            {akaWon && combat.type_victoire && (
              <Chip
                label={typeVictoireLabel(combat.type_victoire)}
                size="small"
                sx={{
                  height: 14,
                  fontSize: "0.55rem",
                  bgcolor: `${C.aka}20`,
                  color: C.aka,
                  px: 0,
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Divider */}
        <Box sx={{ height: "1px", bgcolor: C.border }} />

        {/* AO */}
        <Box sx={rowStyle(aoWon, C.ao)}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: aoWon ? C.text : C.muted,
              fontWeight: aoWon ? 700 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: isWide ? 120 : 85,
            }}
          >
            {nom(combat.inscription_ao) ||
              (combat.type_victoire === "kiken" ? "BYE" : "—")}
          </Typography>
          <Stack direction="row" alignItems="center" gap={0.4}>
            {termine && (
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: aoWon ? C.ao : C.muted,
                  fontWeight: 700,
                }}
              >
                {combat.score_final_ao}
              </Typography>
            )}
            {aoWon && combat.type_victoire && (
              <Chip
                label={typeVictoireLabel(combat.type_victoire)}
                size="small"
                sx={{
                  height: 14,
                  fontSize: "0.55rem",
                  bgcolor: `${C.ao}20`,
                  color: C.ao,
                  px: 0,
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Status en cours */}
        {enCours && (
          <Box
            sx={{
              bgcolor: `${C.winner}15`,
              px: 1,
              py: 0.3,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{ fontSize: "0.55rem", color: C.winner, letterSpacing: 1 }}
            >
              EN COURS
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

// ── Ligne de connexion SVG entre rounds ───────────────────────────────────
function Connector({ fromY, toY, x, color = C.border }) {
  const midX = 20;
  return (
    <svg
      width={40}
      height={Math.abs(toY - fromY) + 70}
      style={{ overflow: "visible", position: "absolute" }}
    >
      <path
        d={`M 0 ${fromY + 35} H ${midX} V ${toY + 35} H 40`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
    </svg>
  );
}

// ── Bracket Desktop horizontal ─────────────────────────────────────────────
function BracketDesktop({ rounds, repechage, finale }) {
  const CARD_H = 72;
  const GAP = 16;

  return (
    <Box sx={{ overflowX: "auto", pb: 2 }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        gap={5}
        sx={{ minWidth: "max-content", p: 2 }}
      >
        {rounds.map((round, ri) => {
          const perRound = Math.pow(2, rounds.length - 1 - ri);
          const spacing = Math.pow(2, ri) * (CARD_H + GAP) - GAP;

          return (
            <Stack key={ri} gap={0} sx={{ position: "relative" }}>
              {/* Titre du round */}
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: C.muted,
                  letterSpacing: 1.5,
                  textAlign: "center",
                  mb: 1.5,
                  textTransform: "uppercase",
                }}
              >
                {round.etape}
              </Typography>

              {/* Combats */}
              <Stack gap={`${spacing}px`}>
                {round.combats.map((combat, ci) => (
                  <CombatCard key={combat?.id ?? ci} combat={combat} />
                ))}
              </Stack>
            </Stack>
          );
        })}

        {/* Finale / Vainqueur */}
        {finale && (
          <Stack alignItems="center" justifyContent="center" sx={{ pt: 4 }}>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: C.muted,
                letterSpacing: 1.5,
                mb: 1.5,
              }}
            >
              VAINQUEUR
            </Typography>
            <Box sx={{ textAlign: "center" }}>
              <EmojiEvents sx={{ color: C.gold, fontSize: 28, mb: 0.5 }} />
              <Typography
                sx={{ color: C.gold, fontWeight: 800, fontSize: "0.85rem" }}
              >
                {nom(
                  finale.vainqueur_id === finale.inscription_aka_id
                    ? finale.inscription_aka
                    : finale.inscription_ao,
                )}
              </Typography>
            </Box>
          </Stack>
        )}
      </Stack>

      {/* Repêchage */}
      {repechage && Object.keys(repechage).length > 0 && (
        <Box sx={{ mt: 4, px: 2 }}>
          <Box sx={{ borderTop: `1px solid ${C.border}`, pt: 3 }}>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: C.bronze,
                letterSpacing: 2,
                mb: 2,
              }}
            >
              REPÊCHAGE — BRONZE
            </Typography>
            <Stack direction="row" gap={4} flexWrap="wrap">
              {Object.entries(repechage).map(([etape, combats]) => (
                <Box key={etape}>
                  <Typography
                    sx={{ fontSize: "0.6rem", color: C.muted, mb: 1 }}
                  >
                    {etape.includes("aka") ? "Côté AKA" : "Côté AO"}
                  </Typography>
                  <Stack gap={1.5}>
                    {combats.map((c) => (
                      <CombatCard key={c.id} combat={c} />
                    ))}
                  </Stack>
                  {/* Bronze vainqueur */}
                  {combats[combats.length - 1]?.vainqueur_id && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1}
                      sx={{ mt: 1 }}
                    >
                      <MilitaryTech sx={{ color: C.bronze, fontSize: 16 }} />
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: C.bronze,
                          fontWeight: 700,
                        }}
                      >
                        {nom(
                          combats[combats.length - 1].vainqueur_id ===
                            combats[combats.length - 1].inscription_aka_id
                            ? combats[combats.length - 1].inscription_aka
                            : combats[combats.length - 1].inscription_ao,
                        )}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ── Bracket Mobile liste par étape ─────────────────────────────────────────
function BracketMobile({ rounds, repechage, finale }) {
  return (
    <Stack gap={3} sx={{ p: 1 }}>
      {rounds.map((round, ri) => (
        <Box key={ri}>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: C.muted,
              letterSpacing: 1.5,
              mb: 1.5,
              textTransform: "uppercase",
              borderBottom: `1px solid ${C.border}`,
              pb: 0.5,
            }}
          >
            {round.etape}
          </Typography>
          <Stack gap={1.5}>
            {round.combats.map((c, ci) => (
              <CombatCard key={c?.id ?? ci} combat={c} isWide={false} />
            ))}
          </Stack>
        </Box>
      ))}

      {/* Vainqueur */}
      {finale?.vainqueur_id && (
        <Box
          sx={{
            textAlign: "center",
            py: 2,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <EmojiEvents sx={{ color: C.gold, fontSize: 32 }} />
          <Typography sx={{ color: C.gold, fontWeight: 800 }}>
            {nom(
              finale.vainqueur_id === finale.inscription_aka_id
                ? finale.inscription_aka
                : finale.inscription_ao,
            )}
          </Typography>
          <Typography sx={{ color: C.muted, fontSize: "0.7rem" }}>
            Vainqueur
          </Typography>
        </Box>
      )}

      {/* Repêchage mobile */}
      {repechage && Object.keys(repechage).length > 0 && (
        <Box sx={{ borderTop: `1px solid ${C.border}`, pt: 2 }}>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: C.bronze,
              letterSpacing: 2,
              mb: 2,
            }}
          >
            REPÊCHAGE — BRONZE
          </Typography>
          {Object.entries(repechage).map(([etape, combats]) => (
            <Box key={etape} sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "0.6rem", color: C.muted, mb: 1 }}>
                {etape.includes("aka") ? "Côté AKA" : "Côté AO"}
              </Typography>
              <Stack gap={1.5}>
                {combats.map((c) => (
                  <CombatCard key={c.id} combat={c} isWide={false} />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Stack>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function BracketViewer({ configId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchData = useCallback(async () => {
    if (!configId) return;
    try {
      const res = await Instance.get(`/api/configs/${configId}/bracket`);
      setData(res.data?.data || res.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [configId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress sx={{ color: C.winner }} />
      </Stack>
    );

  if (!data)
    return (
      <Typography sx={{ color: C.muted, p: 3 }}>
        Aucun bracket disponible
      </Typography>
    );

  // Séparer bracket principal et repêchage
  const bracketPrincipal = {};
  const repechage = {};

  Object.entries(data).forEach(([etape, combats]) => {
    if (etape.startsWith("Repechage") || etape.startsWith("Bronze")) {
      repechage[etape] = combats;
    } else {
      bracketPrincipal[etape] = combats;
    }
  });

  // Trier les rounds dans l'ordre
  const rounds = ETAPE_ORDER.filter((e) => bracketPrincipal[e]).map((e) => ({
    etape: e,
    combats: bracketPrincipal[e],
  }));

  // Finale pour afficher le vainqueur
  const finale = bracketPrincipal["Finale"]?.[0] ?? null;

  return (
    <Box sx={{ bgcolor: C.bg, borderRadius: 3, overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: `1px solid ${C.border}`,
          bgcolor: C.card,
        }}
      >
        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: "0.9rem" }}>
          Tableau éliminatoire
        </Typography>
      </Box>

      {isMobile ? (
        <BracketMobile rounds={rounds} repechage={repechage} finale={finale} />
      ) : (
        <BracketDesktop rounds={rounds} repechage={repechage} finale={finale} />
      )}
    </Box>
  );
}
