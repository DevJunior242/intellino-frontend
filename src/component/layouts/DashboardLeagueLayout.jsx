import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Settings from "@mui/icons-material/Settings";
import { motion, AnimatePresence } from "framer-motion";
import { UseAuth } from "../../Api/AuthContext";
import ContextSwitcher from "../../Saas/pages/ContextSwitcher";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: "#1e2229",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
  },
});

// ─── Nav Config ───────────────────────────────────────────────────────────────
const navSections = [
  {
    label: "PILOTAGE",
    items: [
      {
        icon: "🏠",
        label: "Acueil",
        to: "/",
        role: ["admin_league", "arbitre_league"],
      },
      {
        icon: "⊞",
        label: "Tableau de bord",
        to: "/dashboard/league/stats",
        role: ["admin_league", "arbitre_league"],
      },
      // {
      //   icon: "≡",
      //   label: "Programme d'activités",
      //   to: "dashboard/programme-activites",
      //   role: ["admin_league", "arbitre_league"],
      // },
    ],
  },
  {
    label: "ORGANISATION",
    items: [
      {
        icon: "🏠",
        label: "Clubs",
        to: "/dashboard/league/clubs",
        role: ["admin_league"],
      },
      {
        icon: "🪪",
        label: "Licences",
        to: "/dashboard/league/licences",
        role: ["admin_league"],
      },
      {
        icon: "⊞",
        label: "Catégories",
        to: "/dashboard/league/categories",
        role: ["admin_league"],
      },
      {
        icon: "👤",
        label: "Bureau & rôles",
        to: "/dashboard/league/bureau",
        role: ["admin_league"],
      },
    ],
  },
  {
    label: "SPORTIF",
    items: [
      {
        icon: "★",
        label: "Compétitions",
        to: "/dashboard/league/competitions",
        role: ["admin_league", "arbitre_league"],
      },
      {
        icon: "📋",
        label: "examens",
        to: "/dashboard/league/examen",
        role: ["admin_league"],
      },
      {
        icon: "▲",
        label: "Grades & examens",
        to: "/dashboard/league/grades",
        role: ["admin_league"],
      },
      {
        icon: "▣",
        label: "Fiche de notation",
        to: "/dashboard/league/notation",
        role: ["super_admin"],
      },
      {
        icon: "👥",
        label: "Athlètes",
        to: "/dashboard/league/athletes",
        role: ["admin_league"],
      },
      {
        icon: "👤",
        label: "Arbitres",
        to: "/dashboard/league/arbitres",
        role: ["admin_league"],
      },
    ],
  },
  // {
  //   label: "Ligue",
  //   items: [
  //     {
  //       icon: <Settings />,
  //       label: "Configuration ligue",
  //       to: "/dashboard/league/category",
  //       role: ["admin_league"],
  //     },
  //   ],
  // },
  // {
  //   label: "Notation",
  //   items: [
  //     {
  //       icon: <Settings />,
  //       label: "Configuration notation",
  //       to: "/dashboard/league/confignotation",
  //       role: ["admin_league"],
  //     },
  //     {
  //       icon: <Settings />,
  //       label: "validation notation",
  //       to: "/dashboard/league/ConfigNotationCardDetails",
  //       role: ["admin_league", "arbitre_league"],
  //     },
  //   ],
  // },
];

// ─── Motion Variants ──────────────────────────────────────────────────────────
const fadeIn = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const sidebarVariants = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const navItemVariants = {
  hidden: { x: -16, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({
  activeItem,
  setActiveItem,
  hasAccess,
  navigate,
  onClose,
  isCollapsed,
  handleLogout,
}) {
  let itemIndex = 0;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
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
          justifyContent: isCollapsed ? "center" : "flex-start", // Centrer si réduit
        }}
      >
        {!isCollapsed && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#e8c84a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{ color: "#1a1d23", fontWeight: 900, fontSize: "1rem" }}
            >
              ★
            </Typography>
          </Box>
        )}
        {!isCollapsed && (
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#e8eaf0" }}
            >
              Karaté<span style={{ color: "#e8c84a" }}>Ligue</span>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ligue Nationale
            </Typography>
          </Box>
        )}
        {isCollapsed && (
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
        )}
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "text.secondary", ml: "auto" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <ContextSwitcher isCollapsed={isCollapsed} />

      {/* Nav */}
      <Box sx={{ flex: 1, py: 1 }}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.role ? hasAccess(item.role) : true,
          );
          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.label} sx={{ mb: 1 }}>
              {!isCollapsed && (
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
              )}

              {visibleItems.map((item) => {
                const idx = itemIndex++;
                return (
                  <motion.div
                    key={item.label}
                    custom={idx}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <ListItemButton
                      selected={activeItem === item.label}
                      onClick={() => {
                        setActiveItem(item.label);
                        if (item.to) navigate(item.to);
                        if (onClose) onClose();
                      }}
                      sx={{
                        mx: 1,
                        borderRadius: 2,
                        mb: 0.3,
                        py: 0.8,
                        justifyContent: isCollapsed ? "center" : "flex-start", // Centrer si réduit
                        "&.Mui-selected": {
                          bgcolor: "rgba(232,200,74,0.12)",
                          "&:hover": { bgcolor: "rgba(232,200,74,0.18)" },
                        },
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 28,
                          fontSize: "0.9rem",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!isCollapsed && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.82rem",
                            fontWeight: activeItem === item.label ? 600 : 400,
                            color:
                              activeItem === item.label ? "#e8c84a" : "#c0c4d0",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </motion.div>
                );
              })}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)", mt: "auto" }}>
        {/* Bouton de déconnexion */}
        <List disablePadding>
          <ListItem disablePadding>
            {isCollapsed ? (
              <Tooltip title="Déconnexion" placement="right" arrow>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    justifyContent: "center",
                    px: 0,
                    minHeight: 44,
                    color: "rgba(220,80,80,0.8)",
                    "&:hover": {
                      bgcolor: "rgba(220,80,80,0.08)",
                      color: "#f55",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: "inherit",
                      justifyContent: "center",
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            ) : (
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  px: 1.5,
                  minHeight: 44,
                  color: "rgba(220,80,80,0.8)",
                  "&:hover": { bgcolor: "rgba(220,80,80,0.08)", color: "#f55" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{ fontSize: 13 }}
                />
              </ListItemButton>
            )}
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardLeagueLayout() {
  const [activeItem, setActiveItem] = useState("Tableau de bord");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { activeType, auth, activeRole, logout } = UseAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isCollapsed, setIsCollapsed] = useState(false);
  if (!auth?.isLogin) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (activeType !== "Ligue") {
    return <Navigate to="/dashboard" replace />;
  }

  const hasAccess = (allowedRoles = []) => {
    if (!auth?.isLogin) return false;
    return allowedRoles.includes(activeRole);
  };

  const sidebarProps = {
    activeItem,
    setActiveItem,
    hasAccess,
    navigate,
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          bgcolor: "#1a1d23",
          fontFamily: "'Sora', sans-serif",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        {/* ── Desktop Sidebar ── */}
        {!isMobile && (
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            style={{ flexShrink: 0 }}
          >
            <Box
              sx={{
                width: isCollapsed ? 64 : 240, // Largeur réduite ou normale
                bgcolor: "#1e2229",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.3s ease", // Animation fluide
              }}
            >
              {/* Bouton pour réduire/étendre la sidebar */}
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{
                    color: "#e8eaf0",
                    bgcolor: "rgba(255,255,255,0.06)",
                    borderRadius: 1.5,
                    "&:hover": { bgcolor: "rgba(232,200,74,0.12)" },
                  }}
                >
                  {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </Box>

              {/* Contenu de la sidebar */}
              <SidebarContent
                {...sidebarProps}
                isCollapsed={isCollapsed}
                onClose={null}
                handleLogout={handleLogout}
              />
            </Box>
          </motion.div>
        )}
        {/* ── Mobile Drawer ── */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            SlideProps={{
              // Use framer-motion-style easing via MUI's transition override
              timeout: { enter: 320, exit: 240 },
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: 240,
              },
            }}
          >
            <SidebarContent
              {...sidebarProps}
              onClose={() => setMobileOpen(false)}
              handleLogout={handleLogout}
            />
          </Drawer>
        )}
        {/* ── Main Content ── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0, // prevent flex blowout
          }}
        >
          {/* Header */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                bgcolor: "#1a1d23",
                gap: 1,
              }}
            >
              {/* Mobile hamburger */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {isMobile && (
                  <IconButton
                    size="small"
                    onClick={() => setMobileOpen(true)}
                    sx={{
                      color: "#e8eaf0",
                      bgcolor: "rgba(255,255,255,0.06)",
                      borderRadius: 1.5,
                      "&:hover": { bgcolor: "rgba(232,200,74,0.12)" },
                    }}
                  >
                    <MenuIcon fontSize="small" />
                  </IconButton>
                )}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "0.95rem", md: "1.1rem" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "#e8c84a",
                  }}
                >
                  {activeItem}
                </Typography>
              </Box>

              {/* Right side */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, md: 2 },
                  flexShrink: 0,
                }}
              >
                <Chip
                  label={isMobile ? "2025–2026" : "Saison 2025–2026"}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "rgba(232,200,74,0.4)",
                    color: "#e8c84a",
                    fontWeight: 600,
                    fontSize: "0.72rem",
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
                      "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                      transition: "background 0.2s",
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
              p: { xs: 2, md: 3 },
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              },
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
