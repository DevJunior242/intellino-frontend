import { Box, Stack, Typography } from "@mui/material";
import useCompetitionTheme from "./useCompetitionTheme";

export default function PenaliteDisplay({ combat }) {
  const T = useCompetitionTheme();
  const penalitesAka =
    combat?.actions?.filter(
      (a) => a.combattant === "aka" && a.type === "penalite",
    )?.length ?? 0;

  const penalitesAo =
    combat?.actions?.filter(
      (a) => a.combattant === "ao" && a.type === "penalite",
    )?.length ?? 0;

  const labels = ["C", "K", "HC", "H"];

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {/* AKA */}
      <Stack direction="row" gap={0.5}>
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              bgcolor: i < penalitesAka ? T.warning : "transparent",
              border: `1px solid ${T.warning}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {i < penalitesAka && (
              <Typography
                sx={{ fontSize: "0.55rem", fontWeight: 700, color: "#000" }}
              >
                {labels[i]}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>

      <Typography sx={{ color: T.textMuted, fontSize: "0.7rem" }}>PEN</Typography>

      {/* AO */}
      <Stack direction="row" gap={0.5}>
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              bgcolor: i < penalitesAo ? T.warning : "transparent",
              border: `1px solid ${T.warning}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {i < penalitesAo && (
              <Typography
                sx={{ fontSize: "0.55rem", fontWeight: 700, color: "#000" }}
              >
                {labels[i]}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
