import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Outlet, useNavigate } from "react-router-dom";
import { Settings } from "@mui/icons-material";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#1a1d23", paper: "#22262f" },
    primary: { main: "#e8c84a" },
    text: { primary: "#e8eaf0", secondary: "#8b90a0" },
  },
  typography: {
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

const navSections = [
  {
    label: "PILOTAGE",
    items: [
      {
        icon: "⊞",
        label: "Tableau de bord",
        active: true,
        to: "/dashboard/league/stats",
      },
      {
        icon: "≡",
        label: "Programme d'activités",
        to: "dashboard/programme-activites",
      },
    ],
  },
  {
    label: "ORGANISATION",
    items: [
      {
        icon: "🏠",
        label: "Clubs",
        to: "dashboard/league/clubs",
      },
      { icon: "🪪", label: "Licences", to: "dashboard/league/licences" },
      { icon: "⊞", label: "Catégories", to: "/dashboard/league/categories" },
      { icon: "👤", label: "Bureau & rôles", to: "/dashboard/bureau" },
    ],
  },
  {
    label: "SPORTIF",
    items: [
      { icon: "★", label: "Compétitions", to: "/dashboard/competitions" },
      { icon: "▲", label: "Grades & examens", to: "/dashboard/grades" },
      { icon: "▣", label: "Fiche de notation", to: "/dashboard/notation" },
      { icon: "👥", label: "Athlètes", to: "/dashboard/athletes" },
    ],
  },
  { label: "FINANCE", items: [{ icon: "▣", label: "Paiements" }] },
  {
    label: "LEAGUE",
    items: [
      {
        icon: <Settings />,
        label: "Configuration ligue",
        to: "/dashboard/league/setup",
      },
    ],
  },
  {
    label: "Notation",
    items: [
      {
        icon: <Settings />,
        label: "Configuration notation",
        to: "/dashboard/confignotation",
      },
    ],
  },
];
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardLeagueLayout() {
  const [activeItem, setActiveItem] = useState("Tableau de bord");
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          bgcolor: "#1a1d23",
          fontFamily: "'Sora', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── Sidebar ── */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              width: 240,
              bgcolor: "#1e2229",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              },
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                p: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "#e8c84a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{ color: "#1a1d23", fontWeight: 900, fontSize: "1rem" }}
                >
                  ★
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#e8eaf0" }}
                >
                  Karaté<span style={{ color: "#e8c84a" }}>Ligue</span>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ligue Nationale
                </Typography>
              </Box>
            </Box>

            {/* Nav */}
            <Box sx={{ flex: 1, py: 1 }}>
              {navSections.map((section) => (
                <Box key={section.label} sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2.5,
                      py: 1,
                      display: "block",
                      color: "#555a6b",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {section.label}
                  </Typography>
                  {section.items.map((item) => (
                    <ListItemButton
                      key={item.label}
                      selected={activeItem === item.label}
                      onClick={() => {
                        setActiveItem(item.label);
                        if (item.to) {
                          navigate(item.to);
                        }
                      }}
                      sx={{
                        mx: 1,
                        borderRadius: 2,
                        mb: 0.3,
                        py: 0.8,
                        "&.Mui-selected": {
                          bgcolor: "rgba(232,200,74,0.12)",
                          "&:hover": { bgcolor: "rgba(232,200,74,0.18)" },
                        },
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 28, fontSize: "0.9rem" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.82rem",
                          fontWeight: activeItem === item.label ? 600 : 400,
                          color:
                            activeItem === item.label ? "#e8c84a" : "#c0c4d0",
                        }}
                      />
                    </ListItemButton>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* ── Main Content ── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Box
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                bgcolor: "#1a1d23",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {activeItem}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip
                  label="Saison 2024–2025"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "rgba(232,200,74,0.4)",
                    color: "#e8c84a",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
                <Badge badgeContent={3} color="error">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.07)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Typography>🔔</Typography>
                  </Box>
                </Badge>
              </Box>
            </Box>
          </motion.div>
          {/* Scrollable body */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 3,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              },
            }}
          >
            {/* {content} */}
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
