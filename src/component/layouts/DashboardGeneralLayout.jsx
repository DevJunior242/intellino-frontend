import { Suspense, useMemo, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import LoadingScreen from "../LoadingScreen";
import {
  Box,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  ThemeProvider,
  createTheme,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { dashboardSettingTheme } from "../../theme";
import ThemeToggle from "../../ThemeToggle";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Settings from "@mui/icons-material/Settings";
import { motion, AnimatePresence } from "framer-motion";
import { UseAuth } from "../../Api/AuthContext";
import ContextSwitcher from "../../Saas/pages/ContextSwitcher";
import NotificationCenter from "../NotificationCenter";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeIcon from "@mui/icons-material/Badge";
import CategoryIcon from "@mui/icons-material/Category";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import EventNoteIcon from "@mui/icons-material/EventNote";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import GradingIcon from "@mui/icons-material/Grading";
import InsertInvitationSharpIcon from "@mui/icons-material/InsertInvitationSharp";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"; // ─── Theme ────────────────────────────────────────────────────────────────────
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrialBanner from "../TrialBanner";
import TierBanner from "../TierBanner";

// ─── Nav Config ───────────────────────────────────────────────────────────────
const getNavSections = (activeType) => {
  const isFederation = activeType?.toLowerCase() === "federation";

  return [
    {
      label: "PILOTAGE",
      items: [
        {
          icon: <HomeOutlinedIcon fontSize="small" />,
          label: "Acueil",
          to: "/",
          role: ["admin", "arbitre"],
        },
        {
          icon: <DashboardIcon fontSize="small" />,
          label: "Tableau de bord",
          to: isFederation
            ? "/dashboard/federation/stats"
            : "/dashboard/league/stats",
          role: ["admin", "arbitre"],
        },
        {
          icon: <CalendarMonthIcon fontSize="small" />,
          label: "Programme d'activités",
          to: isFederation
            ? "/dashboard/federation/activity"
            : "/dashboard/league/activity",
          role: ["admin", "arbitre"],
        },
      ],
    },
    {
      label: "ORGANISATION",
      items: [
        {
          icon: <AccountTreeIcon fontSize="small" />,
          label: "Structure",
          to: "/dashboard/federation/structure",
          role: ["admin"],
          showFor: ["federation"],
        },
        {
          icon: <GroupsIcon fontSize="small" />,
          label: "Clubs",
          to: "/dashboard/league/clubs",
          role: ["admin"],
          showFor: ["ligue"],
        },
        {
          icon: <BadgeIcon fontSize="small" />,
          label: "Licences",
          to: isFederation
            ? "/dashboard/federation/licences"
            : "/dashboard/league/licences",
          role: ["admin"],
        },
        {
          icon: <CategoryIcon fontSize="small" />,
          label: "Catégories",
          to: isFederation
            ? "/dashboard/federation/categories"
            : "/dashboard/league/categories",
          role: ["admin"],
        },
        {
          icon: <VerifiedUserIcon fontSize="small" />,
          label: "Affiliation",
          to: "/dashboard/federation/affiliations",
          role: ["admin"],
          showFor: ["federation"],
        },
        {
          icon: <SupervisorAccountIcon fontSize="small" />,
          label: "Bureau & rôles",
          to: isFederation
            ? "/dashboard/federation/bureau"
            : "/dashboard/league/bureau",
          role: ["admin"],
        },
        {
          icon: <EventNoteIcon fontSize="small" />,
          label: "Stages",
          to: "/dashboard/league/stage",
          role: ["admin"],
        },
      ],
    },
    {
      label: "SPORTIF",
      items: [
        {
          icon: <EmojiEventsIcon fontSize="small" />,
          label: "Compétitions",
          to: "/dashboard/league/competitions",
          role: ["admin", "arbitre"],
        },

        {
          icon: <WorkspacePremiumIcon fontSize="small" />,
          label: "Grades & examens",
          to: "/dashboard/league/grades",
          role: ["admin"],
        },
        {
          icon: <FactCheckIcon fontSize="small" />,
          label: "Inscriptions aux épreuves",
          to: isFederation
            ? "/dashboard/federation/competition"
            : "/dashboard/league/competition",
          role: ["admin"],
        },
      ],
    },
    {
      label: "General",
      items: [
        {
          icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
          label: "Comptabilité",
          to: isFederation
            ? "/dashboard/federation/comptabilite"
            : "/dashboard/league/comptabilite",
          role: ["admin"],
        },
        {
          icon: <InsertInvitationSharpIcon fontSize="small" />,
          label: "Invitation",
          to: "/dashboard/federation/invitation",
          role: ["admin"],
          showFor: ["ligue"],
        },

        {
          icon: <Settings fontSize="small" />,
          label: "Paramétrage général",
          to: isFederation
            ? "/dashboard/federation/settings"
            : "/dashboard/league/settings",
          role: ["admin"],
        },
      ],
    },
  ];
};
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
  navSections,
  activeType,
  contextOrganisation,
}) {
  const normalizedType = activeType?.toLowerCase();
  const theme = useTheme();
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
          bgcolor: alpha(theme.palette.text.primary, 0.1),
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
          borderBottom: "1px solid",
          borderColor: "divider",
          justifyContent: isCollapsed ? "center" : "flex-start", // Centrer si réduit
        }}
      >
        {!isCollapsed && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: "primary.contrastText",
                fontWeight: 900,
                fontSize: "1rem",
              }}
            >
              ★
            </Typography>
          </Box>
        )}
        {!isCollapsed && (
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "text.primary",
              }}
            >
              Karaté
              <span style={{ color: theme.palette.primary.main }}>
                {contextOrganisation}
              </span>
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
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                color: "primary.contrastText",
                fontWeight: 900,
                fontSize: "1rem",
              }}
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
          const visibleItems = section.items.filter((item) => {
            const roleOk = item.role ? hasAccess(item.role) : true;
            const typeOk =
              !item.showFor || item.showFor.includes(normalizedType);
            return roleOk && typeOk;
          });
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
                    color: "text.disabled",
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
                      sx={(theme) => ({
                        mx: 1,
                        borderRadius: 2,
                        mb: 0.3,
                        py: 0.8,
                        justifyContent: isCollapsed ? "center" : "flex-start", // Centrer si réduit
                        "&.Mui-selected": {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.18),
                          },
                        },
                        "&:hover": {
                          bgcolor: alpha(theme.palette.text.primary, 0.04),
                        },
                      })}
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
                              activeItem === item.label
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
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
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", mt: "auto" }}>
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
export default function DashboardGeneralLayout() {
  const [activeItem, setActiveItem] = useState("Tableau de bord");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { activeType, auth, activeRole, logout } = UseAuth();

  // Habillage aux couleurs de la FBK réservé aux dashboards (en clair
  // uniquement — le mode sombre garde le thème dashboard existant).
  const outerTheme = useTheme();
  const dashboardTheme = useMemo(
    () => createTheme(dashboardSettingTheme(outerTheme.palette.mode)),
    [outerTheme.palette.mode],
  );
  const isMobile = useMediaQuery(outerTheme.breakpoints.down("md"));
  const [isCollapsed, setIsCollapsed] = useState(false);
  if (!auth?.isLogin) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const contex = activeType?.toLowerCase();
  const contextOrganisation = contex === "federation" ? "Fédération" : "Ligue";

  const normalizedType = activeType?.toLowerCase();

  if (normalizedType !== "ligue" && normalizedType !== "federation") {
    return <Navigate to="/dashboard" replace />;
  }
  const navSections = getNavSections(activeType);
  const hasAccess = (allowedRoles = []) => {
    if (!auth?.isLogin) return false;
    return allowedRoles.includes(activeRole);
  };

  const sidebarProps = {
    activeItem,
    setActiveItem,
    hasAccess,
    navigate,
    navSections,
    activeType,
  };

  return (
    <ThemeProvider theme={dashboardTheme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          bgcolor: "background.default",
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
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
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
                  sx={(theme) => ({
                    color: "text.primary",
                    bgcolor: alpha(theme.palette.text.primary, 0.06),
                    borderRadius: 1.5,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    },
                  })}
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
                navSections={navSections}
                contextOrganisation={contextOrganisation}
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
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
                gap: 1,
              }}
            >
              {/* Mobile hamburger */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {isMobile && (
                  <IconButton
                    size="small"
                    onClick={() => setMobileOpen(true)}
                    sx={(theme) => ({
                      color: "text.primary",
                      bgcolor: alpha(theme.palette.text.primary, 0.06),
                      borderRadius: 1.5,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      },
                    })}
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
                    color: "primary.main",
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
                  sx={(theme) => ({
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    color: "primary.main",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                  })}
                />
                <ThemeToggle />
                <NotificationCenter />
              </Box>
            </Box>
          </motion.div>

          {/* Scrollable body */}
          <Box
            sx={(theme) => ({
              flex: 1,
              overflowY: "auto",
              p: { xs: 2, md: 3 },
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: alpha(theme.palette.text.primary, 0.1),
                borderRadius: 2,
              },
            })}
          >
            <TrialBanner />
            <TierBanner />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              >
                <Suspense fallback={<LoadingScreen />}>
                  <Outlet />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
