import { Box, Skeleton } from "@mui/material";

function ConfigSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            gap: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            px: 2,
            py: 1.5,
          }}
        >
          <Skeleton variant="rounded" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={18} sx={{ mb: 0.5 }} />
            <Skeleton width="35%" height={14} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default ConfigSkeleton;
