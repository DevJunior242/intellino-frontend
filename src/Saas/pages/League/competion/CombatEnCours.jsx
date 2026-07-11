import {
  Box,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChronoCombat from "./ChronoCombat";
import PenaliteDisplay from "./PenaliteDisplay";
import { alpha } from "@mui/material/styles";
import useCompetitionTheme from "./useCompetitionTheme";

// Couleurs des coins de combat (Aka rouge / Ao bleu) : identité fixe, indépendante du thème.
const CORNER = {
  aka: "#ef4444",
  ao: "#3b82f6",
};

export default function CombatEnCours({ combat, canControl = false }) {
  const theme = useTheme();
  const T = useCompetitionTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  if (!combat) return null;

  return (
    <Box
      sx={{
        bgcolor: T.surface,
        borderRadius: 3,
        border: `1px solid ${T.border}`,
        p: isMobile ? 1.5 : 2,
        mb: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: T.text,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Kumite -{combat?.inscription_aka?.competition?.category?.nom ?? "—"}(
        {combat?.inscription_aka?.competition?.category?.sexe ?? "—"})
        {/* Badge étape */}
        {combat?.etape && (
          <Chip
            label={combat.etape}
            size="small"
            sx={{
              bgcolor: alpha(T.warning, 0.13),
              color: T.warning,
              border: `1px solid ${alpha(T.warning, 0.25)}`,
              fontWeight: 700,
              fontSize: "0.65rem",
              ml: 1,
            }}
          />
        )}
      </Typography>
      <Stack
        direction={isMobile ? "column" : "row"}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent="space-between"
        gap={isMobile ? 1.5 : 0}
      >
        {/* AKA */}
        <Box
          sx={{
            textAlign: "center",
            flex: 1,
            borderTop: isMobile ? "none" : `3px solid ${CORNER.aka}`,
            borderLeft: isMobile ? `3px solid ${CORNER.aka}` : "none",
            pt: isMobile ? 1 : 1,
            pl: isMobile ? 1 : 0,
          }}
        >
          <Chip
            label="AKA"
            size={isMobile ? "small" : "small"}
            sx={{
              bgcolor: alpha(CORNER.aka, 0.125),
              color: CORNER.aka,
              fontWeight: 500,
              mb: 0.5,
              fontSize: isMobile ? "0.7rem" : "0.8rem",
            }}
          />
          <Typography
            sx={{
              color: T.text,
              fontWeight: 500,
              fontSize: isMobile ? "0.8rem" : "0.95rem",
              wordBreak: "break-word",
              whiteSpace: isMobile ? "normal" : "nowrap",
              overflow: isMobile ? "visible" : "hidden",
              textOverflow: isMobile ? "unset" : "ellipsis",
            }}
          >
            {combat?.inscription_aka?.athlete?.fullname ?? "—"}
          </Typography>
          <Typography
            sx={{
              color: T.textMuted,
              fontSize: isMobile ? "0.6rem" : "0.7rem",
              wordBreak: "break-word",
            }}
          >
            {combat?.inscription_aka?.organisateur?.name ?? "—"}
          </Typography>
          <Typography
            sx={{
              fontSize: isMobile ? "2rem" : "3rem",
              fontWeight: 500,
              color: CORNER.aka,
              fontVariantNumeric: "tabular-nums",
              mt: isMobile ? 0.5 : 0,
            }}
          >
            {combat?.score_final_aka ?? 0}
          </Typography>
        </Box>

        {/* Centre */}
        <Stack
          alignItems="center"
          gap={1}
          sx={{
            mx: isMobile ? 0 : 2,
            width: isMobile ? "100%" : "auto",
            borderTop: isMobile ? `1px solid ${T.border}` : "none",
            borderBottom: isMobile ? `1px solid ${T.border}` : "none",
            py: isMobile ? 1.5 : 0,
            order: isMobile ? -1 : 0,
          }}
        >
          <ChronoCombat combat={combat} canControl={canControl} />
          {combat?.senshu_id && (
            <Chip
              label={`Senshu → ${combat.senshu_id === combat.inscription_aka_id ? "AKA" : "AO"}`}
              size="small"
              sx={{
                bgcolor: alpha(T.warning, 0.09),
                color: T.warning,
                border: `1px solid ${alpha(T.warning, 0.19)}`,
                fontSize: isMobile ? "0.6rem" : "0.65rem",
                p: isMobile ? "0 4px" : "auto",
              }}
            />
          )}
        </Stack>

        {/* AO */}
        <Box
          sx={{
            textAlign: "center",
            flex: 1,
            borderTop: isMobile ? "none" : `3px solid ${CORNER.ao}`,
            borderRight: isMobile ? `3px solid ${CORNER.ao}` : "none",
            pt: isMobile ? 1 : 1,
            pr: isMobile ? 1 : 0,
          }}
        >
          <Chip
            label="AO"
            size={isMobile ? "small" : "small"}
            sx={{
              bgcolor: alpha(CORNER.ao, 0.125),
              color: CORNER.ao,
              fontWeight: 500,
              mb: 0.5,
              fontSize: isMobile ? "0.7rem" : "0.8rem",
            }}
          />
          <Typography
            sx={{
              color: T.text,
              fontWeight: 500,
              fontSize: isMobile ? "0.8rem" : "0.95rem",
              wordBreak: "break-word",
              whiteSpace: isMobile ? "normal" : "nowrap",
              overflow: isMobile ? "visible" : "hidden",
              textOverflow: isMobile ? "unset" : "ellipsis",
            }}
          >
            {combat?.inscription_ao?.athlete?.fullname ?? "—"}
          </Typography>
          <Typography
            sx={{
              color: T.textMuted,
              fontSize: isMobile ? "0.6rem" : "0.7rem",
              wordBreak: "break-word",
            }}
          >
            {combat?.inscription_ao?.organisateur?.name ?? "—"}
          </Typography>
          <Typography
            sx={{
              fontSize: isMobile ? "2rem" : "3rem",
              fontWeight: 500,
              color: CORNER.ao,
              fontVariantNumeric: "tabular-nums",
              mt: isMobile ? 0.5 : 0,
            }}
          >
            {combat?.score_final_ao ?? 0}
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ mt: 1.5 }}>
        <PenaliteDisplay combat={combat} />
      </Box>
    </Box>
  );
}
