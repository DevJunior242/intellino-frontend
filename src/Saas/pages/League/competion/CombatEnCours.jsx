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

const C = {
  aka: "#ef4444",
  akaLight: "#ef444420",
  ao: "#3b82f6",
  aoLight: "#3b82f620",
  card: "#111827",
  border: "#1e2a3a",
  text: "#e2e8f0",
  muted: "#64748b",
};

export default function CombatEnCours({ combat, canControl = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  if (!combat) return null;

  return (
    <Box
      sx={{
        bgcolor: C.card,
        borderRadius: 3,
        border: `1px solid ${C.border}`,
        p: isMobile ? 1.5 : 2,
        mb: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: C.text,
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
              bgcolor: "#f59e0b20",
              color: "#f59e0b",
              border: "1px solid #f59e0b40",
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
            borderTop: isMobile ? "none" : `3px solid ${C.aka}`,
            borderLeft: isMobile ? `3px solid ${C.aka}` : "none",
            pt: isMobile ? 1 : 1,
            pl: isMobile ? 1 : 0,
          }}
        >
          <Chip
            label="AKA"
            size={isMobile ? "small" : "small"}
            sx={{
              bgcolor: C.akaLight,
              color: C.aka,
              fontWeight: 500,
              mb: 0.5,
              fontSize: isMobile ? "0.7rem" : "0.8rem",
            }}
          />
          <Typography
            sx={{
              color: C.text,
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
              color: C.muted,
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
              color: C.aka,
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
            borderTop: isMobile ? `1px solid ${C.border}` : "none",
            borderBottom: isMobile ? `1px solid ${C.border}` : "none",
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
                bgcolor: "#f59e0b18",
                color: "#f59e0b",
                border: "1px solid #f59e0b30",
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
            borderTop: isMobile ? "none" : `3px solid ${C.ao}`,
            borderRight: isMobile ? `3px solid ${C.ao}` : "none",
            pt: isMobile ? 1 : 1,
            pr: isMobile ? 1 : 0,
          }}
        >
          <Chip
            label="AO"
            size={isMobile ? "small" : "small"}
            sx={{
              bgcolor: C.aoLight,
              color: C.ao,
              fontWeight: 500,
              mb: 0.5,
              fontSize: isMobile ? "0.7rem" : "0.8rem",
            }}
          />
          <Typography
            sx={{
              color: C.text,
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
              color: C.muted,
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
              color: C.ao,
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
