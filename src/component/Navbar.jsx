import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  Box,
  IconButton,
  List,
  ListItem,
  Button,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  ListItemIcon,
  InputBase,
  Typography,
  ListItemText,
  Drawer,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { UseAuth } from "../Api/AuthContext";
import ThemeToggle from "../ThemeToggle";
import NotificationCenter from "./NotificationCenter";

const items = [
  { title: "Accueil", href: "/" },
  { title: "A Propos", href: "/about" },
  { title: "Tarifs", href: "/pricing" },

  { title: "Contact", href: "/contact" },
  { title: "Inscription", href: "/register" },
  { title: "Connexion", href: "/login" },
  { title: "Tableau de bord", href: "/dashboard" },
];

function Navbar() {
  const { auth, logout, user } = UseAuth();
  useEffect(() => {
    console.log("AUTH CHANGED", auth);
  }, [auth]);
  console.log("auth", auth);
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openAccount = Boolean(anchorEl);

  const handleOpenMenu = () => setOpenMenu(!openMenu);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleClickAccount = (event) => setAnchorEl(event.currentTarget);
  const handleCloseAccount = () => setAnchorEl(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const isLogged = auth?.isLogin === true;

  const hasRole =
    (Array.isArray(auth?.role) && auth.role.length > 0) ||
    (Array.isArray(auth?.roleSuperAdmin) && auth.roleSuperAdmin.length > 0);
  const filteredItems = items.filter((item) => {
    if (
      isLogged &&
      ["connexion", "inscription"].includes(item.title.toLowerCase())
    ) {
      return false;
    }
    if (
      !hasRole &&
      ["examens", "competitions", "tableau de bord"].includes(
        item.title.toLowerCase(),
      )
    ) {
      return false;
    }

    return true;
  });
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        backgroundColor: "white",
      }}
    >
      <Box sx={{ display: "flex" }}>
        <ThemeToggle iconColor="rgba(21, 8, 8, 0.88)" />

        <motion.img
          src="/Intellino-Logo.png"
          alt="logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
        />
      </Box>

      {/* Desktop Navigation */}
      <List
        sx={{
          display: { xs: "none", md: "flex" },
          gap: 1,
          ml: 4,
          alignItems: "center",
        }}
      >
        {filteredItems.map((item) => (
          <ListItem key={item.title} sx={{ width: "auto", p: 0 }}>
            <NavLink to={item.href} style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Box
                  component={motion.div}
                  whileHover={{ y: -2 }}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: "relative",
                    cursor: "pointer",
                    color: isActive ? "#1976d2" : "#555",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 15,
                    bgcolor: isActive
                      ? "rgba(25, 118, 210, 0.08)"
                      : ["Inscription", "Connexion"].includes(item.title) &&
                          !isLogged
                        ? "rgba(25, 118, 210, 0.1)"
                        : "transparent",
                    border: isActive
                      ? "1px solid rgba(25, 118, 210, 0.2)"
                      : ["Inscription", "Connexion"].includes(item.title) &&
                          !isLogged
                        ? "1px solid rgba(25, 118, 210, 0.3)"
                        : "1px solid transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#1976d2",
                      bgcolor:
                        ["Inscription", "Connexion"].includes(item.title) &&
                        !isLogged
                          ? "rgba(25, 118, 210, 0.2)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  {item.title}
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        left: "20%",
                        right: "20%",
                        height: "2px",
                        background: "#1976d2",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                </Box>
              )}
            </NavLink>
          </ListItem>
        ))}

        {isLogged && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              <NotificationCenter />

              <Tooltip title="Account settings">
                <IconButton onClick={handleClickAccount} size="small">
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.name?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={openAccount}
              onClose={handleCloseAccount}
              PaperProps={{
                sx: {
                  width: 250,
                  backgroundColor: "background.default",
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleCloseAccount}>
                <Avatar /> compte
              </MenuItem>
              <Divider />

              <MenuItem
                component={Link}
                to="/settings"
                onClick={handleCloseAccount}
                sx={{ textTransform: "none" }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>

                <ListItemText primary="Settings" />
              </MenuItem>

              <MenuItem>
                <Button
                  onClick={handleLogout}
                  sx={{ textTransform: "none", color: "red" }}
                >
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </Button>
              </MenuItem>
            </Menu>
          </>
        )}
      </List>

      {/* Mobile Menu */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <NotificationCenter />

        <Button onClick={handleOpenMenu}>
          <MenuIcon sx={{ color: "#0312b8" }} />
        </Button>

        <Drawer
          anchor="right"
          open={openMenu}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              width: "100%",
              height: "100%",
              bgcolor: "white",
              display: "flex",
              flexDirection: "column",
              px: 4,
              py: 3,
            },
          }}
        >
          {/* Header du drawer */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Avatar en haut si connecté */}
            {auth && (
              <Box
                sx={{
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  pt: 2,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Tooltip title="Account settings">
                  <IconButton onClick={handleClickAccount} size="small">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#fff",
                        color: "#0606CF",
                      }}
                    >
                      {user?.fullname?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            <IconButton onClick={handleCloseMenu}>
              <CloseIcon sx={{ color: "#100b9f", fontSize: 30 }} />
            </IconButton>
          </Box>

          {/* Liens */}
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}
          >
            {filteredItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.href}
                onClick={handleCloseMenu}
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Box
                    component={motion.div}
                    whileHover={{ y: -2 }}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      position: "relative",
                      cursor: "pointer",
                      color: isActive ? "#1976d2" : "#555",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 15,
                      bgcolor: isActive
                        ? "rgba(25, 118, 210, 0.08)"
                        : ["Inscription", "Connexion"].includes(item.title) &&
                            !isLogged
                          ? "rgba(25, 118, 210, 0.1)"
                          : "transparent",
                      border: isActive
                        ? "1px solid rgba(25, 118, 210, 0.2)"
                        : ["Inscription", "Connexion"].includes(item.title) &&
                            !isLogged
                          ? "1px solid rgba(25, 118, 210, 0.3)"
                          : "1px solid transparent",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        color: "#1976d2",
                        bgcolor:
                          ["Inscription", "Connexion"].includes(item.title) &&
                          !isLogged
                            ? "rgba(25, 118, 210, 0.2)"
                            : "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    {item.title}
                  </Box>
                )}
              </NavLink>
            ))}
          </Box>

          {/* Footer */}
        </Drawer>
      </Box>
    </Box>
  );
}

export default Navbar;
