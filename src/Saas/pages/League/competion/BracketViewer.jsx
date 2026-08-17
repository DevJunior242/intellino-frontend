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
import useCompetitionTheme from "./useCompetitionTheme";

// Couleurs fixes, indépendantes du thème : coins de combat, médailles, indicateur live.
const CORNER = { aka: "#ef4444", ao: "#3b82f6" };
const MEDAL = { gold: "#f59e0b", bronze: "#d97706" };
const LIVE = "#00e5c0";

const ETAPE_ORDER = ["Quart-finale", "Demi-finale", "Finale"];

function nom(inscription) {
  // Le capitaine d'une équipe Kata garde un athlete_id (contrainte BDD),
  // donc kata_team prime sur athlete ici, sinon une équipe s'affiche sous
  // le nom de son capitaine.
  return inscription?.kata_team?.nom ?? inscription?.athlete?.fullname ?? "—";
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
  const T = useCompetitionTheme();
  if (!combat)
    return (
      <Box
        sx={{
          width: isWide ? 180 : 140,
          height: 70,
          border: `1px dashed ${T.border}`,
          borderRadius: 2,
          bgcolor: T.surface,
        }}
      />
    );

  const akaWon = combat.vainqueur_id === combat.inscription_aka_id;
  const aoWon = combat.vainqueur_id === combat.inscription_ao_id;
  const enCours = combat.status === 1;
  const termine = combat.status === 2;
  // Combat Kata (duel jugé au vote) : votes_aka/ao sont renseignés au lieu
  // de score_final_aka/ao, qui restent toujours à 0 pour un combat Kata.
  const estKata = combat.votes_aka !== null && combat.votes_aka !== undefined;
  const scoreAka = estKata ? combat.votes_aka : combat.score_final_aka;
  const scoreAo = estKata ? combat.votes_ao : combat.score_final_ao;
  // Les votes existent déjà en Hantei (égalité), pas seulement une fois
  // le combat officiellement clos.
  const afficherScore = termine || combat.status === 3;

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
          border: `1px solid ${enCours ? LIVE : T.border}`,
          borderRadius: 2,
          bgcolor: T.surface,
          overflow: "hidden",
          boxShadow: enCours ? `0 0 12px ${LIVE}30` : "none",
        }}
      >
        {/* AKA */}
        <Box sx={rowStyle(akaWon, CORNER.aka)}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: akaWon ? T.text : T.textMuted,
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
            {afficherScore && (
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: akaWon ? CORNER.aka : T.textMuted,
                  fontWeight: 700,
                }}
              >
                {scoreAka}
              </Typography>
            )}
            {akaWon && combat.type_victoire && (
              <Chip
                label={typeVictoireLabel(combat.type_victoire)}
                size="small"
                sx={{
                  height: 14,
                  fontSize: "0.55rem",
                  bgcolor: `${CORNER.aka}20`,
                  color: CORNER.aka,
                  px: 0,
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Divider */}
        <Box sx={{ height: "1px", bgcolor: T.border }} />

        {/* AO */}
        <Box sx={rowStyle(aoWon, CORNER.ao)}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: aoWon ? T.text : T.textMuted,
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
            {afficherScore && (
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: aoWon ? CORNER.ao : T.textMuted,
                  fontWeight: 700,
                }}
              >
                {scoreAo}
              </Typography>
            )}
            {aoWon && combat.type_victoire && (
              <Chip
                label={typeVictoireLabel(combat.type_victoire)}
                size="small"
                sx={{
                  height: 14,
                  fontSize: "0.55rem",
                  bgcolor: `${CORNER.ao}20`,
                  color: CORNER.ao,
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
              bgcolor: `${LIVE}15`,
              px: 1,
              py: 0.3,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{ fontSize: "0.55rem", color: LIVE, letterSpacing: 1 }}
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
function Connector({ fromY, toY, x, color = "#1e2a3a" }) {
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
  const T = useCompetitionTheme();
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
          const spacing = Math.pow(2, ri) * (CARD_H + GAP) - GAP;

          return (
            <Stack key={ri} gap={0} sx={{ position: "relative" }}>
              {/* Titre du round */}
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: T.textMuted,
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
        {finale?.vainqueur_id && (
          <Stack alignItems="center" justifyContent="center" sx={{ pt: 4 }}>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: T.textMuted,
                letterSpacing: 1.5,
                mb: 1.5,
              }}
            >
              VAINQUEUR
            </Typography>
            <Box sx={{ textAlign: "center" }}>
              <EmojiEvents sx={{ color: MEDAL.gold, fontSize: 28, mb: 0.5 }} />
              <Typography
                sx={{ color: MEDAL.gold, fontWeight: 800, fontSize: "0.85rem" }}
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
          <Box sx={{ borderTop: `1px solid ${T.border}`, pt: 3 }}>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: MEDAL.bronze,
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
                    sx={{ fontSize: "0.6rem", color: T.textMuted, mb: 1 }}
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
                      <MilitaryTech sx={{ color: MEDAL.bronze, fontSize: 16 }} />
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: MEDAL.bronze,
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
  const T = useCompetitionTheme();
  return (
    <Stack gap={3} sx={{ p: 1 }}>
      {rounds.map((round, ri) => (
        <Box key={ri}>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: T.textMuted,
              letterSpacing: 1.5,
              mb: 1.5,
              textTransform: "uppercase",
              borderBottom: `1px solid ${T.border}`,
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
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <EmojiEvents sx={{ color: MEDAL.gold, fontSize: 32 }} />
          <Typography sx={{ color: MEDAL.gold, fontWeight: 800 }}>
            {nom(
              finale.vainqueur_id === finale.inscription_aka_id
                ? finale.inscription_aka
                : finale.inscription_ao,
            )}
          </Typography>
          <Typography sx={{ color: T.textMuted, fontSize: "0.7rem" }}>
            Vainqueur
          </Typography>
        </Box>
      )}

      {/* Repêchage mobile */}
      {repechage && Object.keys(repechage).length > 0 && (
        <Box sx={{ borderTop: `1px solid ${T.border}`, pt: 2 }}>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: MEDAL.bronze,
              letterSpacing: 2,
              mb: 2,
            }}
          >
            REPÊCHAGE — BRONZE
          </Typography>
          {Object.entries(repechage).map(([etape, combats]) => (
            <Box key={etape} sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "0.6rem", color: T.textMuted, mb: 1 }}>
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
  const T = useCompetitionTheme();
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
        <CircularProgress sx={{ color: LIVE }} />
      </Stack>
    );

  if (!data)
    return (
      <Typography sx={{ color: T.textMuted, p: 3 }}>
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
    <Box sx={{ bgcolor: T.bg, borderRadius: 3, overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: `1px solid ${T.border}`,
          bgcolor: T.surface,
        }}
      >
        <Typography sx={{ color: T.text, fontWeight: 700, fontSize: "0.9rem" }}>
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
