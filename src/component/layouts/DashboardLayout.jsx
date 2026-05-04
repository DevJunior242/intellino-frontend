import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import { useState } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SchoolIcon from "@mui/icons-material/School";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import TuneIcon from "@mui/icons-material/Tune";

import { UseAuth } from "../../Api/AuthContext";
import TopBar from "../../Header/Topbar";
import ContextSwitcher from "../../Saas/pages/ContextSwitcher";
import DrawerMenu from "../../Saas/pages/DrawerMenu";
import { useAllowAccess } from "../../Hook/useAllowAccess";
import { Groups, PeopleAlt, Settings } from "@mui/icons-material";

const DRAWER_EXPANDED = 240;
const DRAWER_COLLAPSED = 60;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { allowAccess } = useAllowAccess();
  const { logout, activeRole, auth, activeType } = UseAuth();
  console.log("activeRole", activeRole);

  const isSuperAdmin = activeRole === "super_admin";

  const isWrongContext = activeType !== "Club" && !isSuperAdmin;
  if (!auth?.isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (isWrongContext) {
    return <Navigate to="/dashboard/league/stats" replace />;
  }
  const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

  const hasAccess = (allowedRoles = []) => {
    if (!auth?.isLogin) return false;
    return allowedRoles.includes(activeRole);
  };

  const clubAllow = [
    "admin_club",
    "instructeur",
    "secretaire",
    "parent",
    "karateka",
    "super_admin",
  ];
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menu = [
    {
      section: "Principal",
      items: [
        {
          title: "Accueil",
          icon: <HomeOutlinedIcon fontSize="small" />,
          to: "/",
          role: [
            "super_admin",
            "admin_club",
            "instructeur",
            "parent",
            "secretaire",
            "karateka",
          ],
        },
        {
          title: "Dashboard",
          icon: <DashboardIcon fontSize="small" />,
          to: `${clubAllow.includes(activeRole) ? "/dashboard" : "/dashboard/league/stats"}`,
          role: [
            "super_admin",
            "admin_club",
            "instructeur",
            "parent",
            "secretaire",
            "karateka",
          ],
        },
      ],
    },
    {
      section: "Gestion",
      items: [
        {
          title: "Clubs",
          icon: <Groups fontSize="small" />,
          to: "/dashboard/clubs",
          role: ["super_admin"],
        },

        {
          title: "Users",
          icon: <PeopleAlt fontSize="small" />,
          to: "/dashboard/users",
          role: ["super_admin"],
        },
        {
          title: "Karateka",
          icon: <PeopleAlt fontSize="small" />,
          to: "/dashboard/karateka/list",
          role: ["super_admin"],
        },
        {
          title: "Élèves",
          icon: <SchoolIcon fontSize="small" />,
          to: "/dashboard/student/list",
          role: ["admin_club", "instructeur", "secretaire"],
        },
        {
          title: "Membres du club",
          icon: <PeopleOutlineOutlinedIcon fontSize="small" />,
          to: "/dashboard/members",
          role: [
            "admin_club",
            "instructeur",
            "parent",
            "secretaire",
            "karateka",
          ],
        },

        {
          title: "Sessions (cours)",
          icon: <EventNoteIcon fontSize="small" />,
          to: "/dashboard/session/list",
          role: ["admin_club", "instructeur"],
        },
        {
          title: "Grade",
          icon: <StarOutlineIcon fontSize="small" />,
          to: "/dashboard/grade/store",
          role: ["super_admin"],
        },
      ],
    },
    {
      section: "Finance",
      items: [
        {
          title: "Gestion des tarifs",
          icon: <TuneIcon fontSize="small" />,
          to: "/dashboard/payment/settings",
          role: ["admin_club", "secretaire"],
        },
        {
          title: "Dettes",
          icon: <ShoppingCartIcon fontSize="small" />,
          to: "/dashboard/dettes",
          role: ["admin_club", "secretaire"],
        },
        {
          title: "Dette",
          icon: <ShoppingCartIcon fontSize="small" />,
          to: "/dashboard/caisse",
          role: ["parent"],
        },
        {
          title: "Paiements",
          icon: <PaymentIcon fontSize="small" />,
          to: "/dashboard/payment/store",
          role: ["admin_club", "secretaire"],
        },
        {
          title: "Factures",
          icon: <ReceiptIcon fontSize="small" />,
          to: "/dashboard/payment/factures",
          role: ["admin_club", "secretaire", "karateka", "parent"],
        },
      ],
    },
    {
      section: "Admin",
      items: [
        {
          title: "Ajouter un plan",
          icon: <AddCircleOutlineIcon fontSize="small" />,
          to: "/dashboard/plan/store",
          role: ["super_admin"],
        },
        {
          title: "Ajouter discipline",
          icon: <AddCircleOutlineIcon fontSize="small" />,
          to: "/dashboard/discipline/store",
          role: ["super_admin"],
        },
      ],
    },
    {
      label: "LEAGUE",
      items: [
        {
          icon: <Settings />,
          title: "Configuration ligue",
          to: "/dashboard/config/category",
          role: ["super_admin"],
        },
      ],
    },
    {
      section: "Autres",
      items: [
        {
          title: "Catalogue",
          icon: <ShoppingCartIcon fontSize="small" />,
          to: "/dashboard/catalogue",
          role: ["admin_club", "secretaire"],
        },
        {
          title: "FAQ",
          icon: <HelpOutlineIcon fontSize="small" />,
          to: "/faq",
          role: [
            "super_admin",
            "admin_club",
            "instructeur",
            "parent",
            "secretaire",
            "karateka",
          ],
        },
      ],
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1a1d23",
        overflowX: "hidden",
      }}
    >
      {/* Header: avatar + user info + toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: collapsed ? 0 : 1.5,
          py: 1.5,
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          minHeight: 64,
          transition: "padding 0.25s",
        }}
      >
        {!collapsed && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              overflow: "hidden",
            }}
          >
            <Avatar
              src={auth?.user?.photo_url}
              sx={{
                width: 34,
                height: 34,
                bgcolor: deepPurple[500],
                fontSize: 14,
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              {auth?.user?.fullname?.charAt(0)}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography
                noWrap
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {auth?.user?.fullname}
              </Typography>
              <Typography
                noWrap
                sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}
              >
                {activeRole?.replace("_", " ")}
              </Typography>
            </Box>
          </Box>
        )}

        {collapsed && (
          <Tooltip title={auth?.user?.fullname} placement="right">
            <Avatar
              src={auth?.user?.photo_url}
              sx={{
                width: 34,
                height: 34,
                bgcolor: deepPurple[500],
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {auth?.user?.fullname?.charAt(0)}
            </Avatar>
          </Tooltip>
        )}

        {!collapsed && (
          <IconButton
            size="small"
            onClick={() => setCollapsed(true)}
            sx={{
              color: "rgba(255,255,255,0.4)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.07)" },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Context switcher — masqué en mode collapsed */}
      {!collapsed && <ContextSwitcher />}

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 0.5 }}>
        {menu.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasAccess(item.role),
          );
          if (visibleItems.length === 0) return null;

          return (
            <Box key={group.section}>
              {!collapsed && (
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.28)",
                    px: 2,
                    pt: 1.5,
                    pb: 0.5,
                  }}
                >
                  {group.section}
                </Typography>
              )}

              <List disablePadding>
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.to;

                  const btn = (
                    <ListItemButton
                      onClick={() => {
                        navigate(item.to);
                        setMobileOpen(false);
                      }}
                      sx={{
                        minHeight: 40,
                        px: collapsed ? 0 : 1.5,
                        justifyContent: collapsed ? "center" : "flex-start",
                        borderLeft: isActive
                          ? "3px solid #ff6900"
                          : "3px solid transparent",
                        backgroundColor: isActive
                          ? "rgba(255,105,0,0.10)"
                          : "transparent",
                        color: isActive ? "#ff6900" : "rgba(255,255,255,0.65)",
                        borderRadius: 0,
                        "&:hover": {
                          backgroundColor: isActive
                            ? "rgba(255,105,0,0.15)"
                            : "rgba(255,255,255,0.06)",
                          color: isActive ? "#ff6900" : "#fff",
                        },
                        transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: collapsed ? 0 : 34,
                          color: "inherit",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      {!collapsed && (
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            noWrap: true,
                          }}
                        />
                      )}
                    </ListItemButton>
                  );

                  return (
                    <ListItem key={item.title} disablePadding>
                      {collapsed ? (
                        <Tooltip title={item.title} placement="right" arrow>
                          {btn}
                        </Tooltip>
                      ) : (
                        btn
                      )}
                    </ListItem>
                  );
                })}
              </List>

              {!collapsed && (
                <Divider
                  sx={{ borderColor: "rgba(255,255,255,0.06)", my: 0.5 }}
                />
              )}
            </Box>
          );
        })}

        {allowAccess && <DrawerMenu collapsed={collapsed} />}
      </Box>

      {/* Footer: bouton expand + logout */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Bouton expand quand collapsed */}
        {collapsed && (
          <Tooltip title="Agrandir le menu" placement="right" arrow>
            <IconButton
              onClick={() => setCollapsed(false)}
              sx={{
                width: "100%",
                borderRadius: 0,
                color: "rgba(255,255,255,0.4)",
                py: 1,
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <List disablePadding>
          <ListItem disablePadding>
            {collapsed ? (
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

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <TopBar />

      {/* DRAWER MOBILE */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_EXPANDED,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* DRAWER DESKTOP */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: "none",
            overflowX: "hidden",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: { xs: 7, md: 9 },
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: "auto",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>

      {/* BOUTON MENU MOBILE */}
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          color: "primary.main",
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: { xs: "flex", md: "none" },
          bgcolor: "background.paper",
          boxShadow: 3,
        }}
      >
        <MenuIcon />
      </IconButton>
    </Box>
  );
}
