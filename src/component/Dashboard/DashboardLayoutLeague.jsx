import { useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Badge,
  ThemeProvider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
// Importe ton theme et tes navSections ici...

export default function DashboardLayoutLeague({
  children,
  title = "Tableau de bord",
}) {
  const [activeItem, setActiveItem] = useState("Tableau de bord");
  const theme = {
    bg: "#1a1d23",
    surface: "#13161e",
    surfaceHigh: "#1a1e2a",
    border: "#252a38",
    borderHover: "#353c52",
    accent: "#6c63ff",
    accentLight: "#8b84ff",
    accentDim: "rgba(108,99,255,0.15)",
    teal: "#1de4bd",
    tealDim: "rgba(29,228,189,0.12)",
    amber: "#f5a623",
    amberDim: "rgba(245,166,35,0.12)",
    text: "#e8eaf0",
    textMuted: "#7a8099",
    textFaint: "#3e4460",
    success: "#22c55e",
    successDim: "rgba(34,197,94,0.12)",
    danger: "#ef4444",
    dangerDim: "rgba(239,68,68,0.1)",
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          bgcolor: "#1a1d23",
          overflow: "hidden",
        }}
      >
        {/* ── Sidebar (Ton code existant ici) ── */}
        <Box
          sx={{
            width: 240,
            bgcolor: "#1e2229",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* ... Contenu de la sidebar ... */}
        </Box>

        {/* ── Main Content Area ── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header Dynamique */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label="Saison 2025-2026"
                variant="outlined"
                size="small"
                sx={{ color: "#e8c84a" }}
              />
              <Badge badgeContent={3} color="error">
                <Box
                  sx={{
                    p: 1,
                    bgcolor: "rgba(255,255,255,0.07)",
                    borderRadius: 2,
                  }}
                >
                  🔔
                </Box>
              </Badge>
            </Box>
          </Box>

          {/* Zone de contenu interchangeable */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>{children}</Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
