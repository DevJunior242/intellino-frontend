import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import useCompetitionTheme from "./useCompetitionTheme";

// Couleurs des coins de combat (Aka rouge / Ao bleu) : identité fixe, indépendante du thème.
const CORNER = { aka: "#ef4444", ao: "#3b82f6" };

// Le capitaine d'une équipe Kata garde un athlete_id (contrainte BDD), donc
// kata_team prime sur athlete ici, sinon une équipe s'affiche sous le nom de
// son capitaine.
function nomInscription(inscription) {
  return inscription?.kata_team?.nom ?? inscription?.athlete?.fullname ?? "—";
}

/**
 * Affiche l'adversaire (duel Aka/Ao) et le contexte du passage en cours —
 * étape du tableau, et pour une finale d'équipe le côté Kata ou Bunkai
 * (Art. 3.5/5.4.3 WKF). Purement présentationnel : pas d'appel API propre,
 * réutilise le `passage` (OrdrePassage avec combat chargé) déjà récupéré par
 * le panneau parent.
 */
export default function DuelKataEnCours({ passage }) {
  const T = useCompetitionTheme();
  const combat = passage?.combat;

  if (!combat) return null;

  const estAka = passage?.inscription_id === combat.inscription_aka_id;
  const adversaire = estAka ? combat.inscription_ao : combat.inscription_aka;

  return (
    <Box
      sx={{
        bgcolor: T.surface,
        borderRadius: 3,
        border: `1px solid ${T.border}`,
        p: 1.5,
        mb: 2,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Chip
            label={estAka ? "AKA" : "AO"}
            size="small"
            sx={{
              bgcolor: alpha(estAka ? CORNER.aka : CORNER.ao, 0.15),
              color: estAka ? CORNER.aka : CORNER.ao,
              fontWeight: 700,
              fontSize: "0.65rem",
            }}
          />
          <Typography sx={{ color: T.textMuted, fontSize: "0.8rem" }}>
            vs
          </Typography>
          <Typography
            sx={{ color: T.text, fontWeight: 600, fontSize: "0.9rem" }}
          >
            {nomInscription(adversaire)}
          </Typography>
        </Stack>

        <Stack direction="row" gap={0.5} flexWrap="wrap">
          {combat.etape && (
            <Chip
              label={combat.etape}
              size="small"
              sx={{
                bgcolor: "action.hover",
                color: T.textMuted,
                fontSize: "0.65rem",
              }}
            />
          )}
          {passage?.phase && (
            <Chip
              label={passage.phase === "bunkai" ? "Bunkai" : "Kata"}
              size="small"
              color={passage.phase === "bunkai" ? "warning" : "primary"}
              sx={{ fontWeight: 700, fontSize: "0.65rem" }}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
