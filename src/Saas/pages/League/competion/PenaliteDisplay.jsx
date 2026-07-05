import { Box, Stack, Typography } from "@mui/material";

export default function PenaliteDisplay({ combat }) {
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
              bgcolor: i < penalitesAka ? "#f59e0b" : "transparent",
              border: "1px solid #f59e0b",
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

      <Typography sx={{ color: "#64748b", fontSize: "0.7rem" }}>PEN</Typography>

      {/* AO */}
      <Stack direction="row" gap={0.5}>
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              bgcolor: i < penalitesAo ? "#f59e0b" : "transparent",
              border: "1px solid #f59e0b",
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
