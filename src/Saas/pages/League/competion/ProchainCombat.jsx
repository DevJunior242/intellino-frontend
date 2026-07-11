import { Box, Chip, Stack, Typography } from "@mui/material";
import useCompetitionTheme from "./useCompetitionTheme";

// Couleurs des coins de combat (Aka rouge / Ao bleu) : identité fixe, indépendante du thème.
const CORNER = { aka: "#ef4444", ao: "#3b82f6" };

export default function ProchainCombat({ nextCombat }) {
  const T = useCompetitionTheme();
  if (!nextCombat) return null;

  return (
    <Box
      sx={{
        bgcolor: T.surface,
        borderRadius: 2,
        border: `1px solid ${T.border}`,
        p: 1.5,
      }}
    >
      <Typography
        sx={{
          color: T.textMuted,
          fontSize: "0.65rem",
          letterSpacing: 1.5,
          mb: 1,
        }}
      >
        PROCHAIN COMBAT
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            sx={{ color: CORNER.aka, fontWeight: 500, fontSize: "0.9rem" }}
          >
            {nextCombat?.inscription_aka?.athlete?.fullname ?? "—"}
          </Typography>
          <Typography sx={{ color: T.textMuted, fontSize: "0.8rem" }}>
            vs
          </Typography>
          <Typography
            sx={{ color: CORNER.ao, fontWeight: 500, fontSize: "0.9rem" }}
          >
            {nextCombat?.inscription_ao?.athlete?.fullname ?? "—"}
          </Typography>
        </Stack>
        <Chip
          label={nextCombat?.etape ?? "—"}
          size="small"
          sx={{ bgcolor: "action.hover", color: T.textMuted, fontSize: "0.65rem" }}
        />
      </Stack>
    </Box>
  );
}
