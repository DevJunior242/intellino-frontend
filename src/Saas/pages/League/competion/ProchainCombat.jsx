import { Box, Chip, Stack, Typography } from "@mui/material";

const C = {
  aka: "#ef4444",
  ao: "#3b82f6",
  card: "#111827",
  border: "#1e2a3a",
  muted: "#64748b",
};

export default function ProchainCombat({ nextCombat }) {
  if (!nextCombat) return null;

  return (
    <Box
      sx={{
        bgcolor: C.card,
        borderRadius: 2,
        border: `1px solid ${C.border}`,
        p: 1.5,
      }}
    >
      <Typography
        sx={{ color: C.muted, fontSize: "0.65rem", letterSpacing: 1.5, mb: 1 }}
      >
        PROCHAIN COMBAT
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            sx={{ color: C.aka, fontWeight: 500, fontSize: "0.9rem" }}
          >
            {nextCombat?.inscription_aka?.athlete?.fullname ?? "—"}
          </Typography>
          <Typography sx={{ color: C.muted, fontSize: "0.8rem" }}>
            vs
          </Typography>
          <Typography sx={{ color: C.ao, fontWeight: 500, fontSize: "0.9rem" }}>
            {nextCombat?.inscription_ao?.athlete?.fullname ?? "—"}
          </Typography>
        </Stack>
        <Chip
          label={nextCombat?.etape ?? "—"}
          size="small"
          sx={{ bgcolor: "#1e2a3a", color: C.muted, fontSize: "0.65rem" }}
        />
      </Stack>
    </Box>
  );
}
