import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
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
import { tokenTheme } from "../theme";
import ThemeToggle from "../ThemeToggle";

const items = [
  { title: "Accueil", href: "/" },
  { title: "About", href: "/about" },
  // { title: "Compétitions", href: "/competitions" },

  { title: "Examens", href: "/examen" },

  { title: "Contact", href: "/contact" },
  { title: "Register", href: "/register" },
  { title: "Login", href: "/login" },
  { title: "Dashboard", href: "/dashboard" },
];

function Navbar() {
  const { auth, logout, user } = UseAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokenTheme(theme.palette.mode);

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
    if (isLogged && ["login", "register"].includes(item.title.toLowerCase())) {
      return false;
    }
    if (
      !hasRole &&
      ["examens", "dashboard"].includes(item.title.toLowerCase())
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
        backgroundColor: "blue",
        color: "white",
      }}
    >
      <Box sx={{ display: "flex" }}>
        <ThemeToggle />

        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            fontSize: "2rem",
            display: { xs: "none", md: "block" },
          }}
        >
          ArtsMartiaux+
        </Typography>
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
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: "relative",
                    cursor: "pointer",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 15,
                    bgcolor: isActive
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.3)"
                      : "1px solid transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  {item.title}
                </Box>
              )}
            </NavLink>
          </ListItem>
        ))}

        {/* User Account */}
        {isLogged && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
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
        <Button onClick={handleOpenMenu}>
          <MenuIcon sx={{ color: "#fff" }} />
        </Button>

        <Drawer
          anchor="right"
          open={openMenu}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              width: "100%",
              height: "100%",
              bgcolor: "#0606CF",
              display: "flex",
              flexDirection: "column",
              px: 4,
              py: 3,
            },
          }}
        >
          {/* Header du drawer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={handleCloseMenu}>
              <CloseIcon sx={{ color: "#fff", fontSize: 30 }} />
            </IconButton>
          </Box>

          {/* Avatar en haut si connecté */}
          {auth && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#fff",
                  color: "#0606CF",
                  fontWeight: "bold",
                }}
              >
                {user?.fullname?.charAt(0)}
              </Avatar>
              <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: 16 }}>
                {user?.name}
              </Typography>
            </Box>
          )}

          {/* Liens */}
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}
          >
            {filteredItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.href}
                onClick={handleCloseMenu}
                style={({ isActive }) => ({
                  textDecoration: "none",
                })}
              >
                {({ isActive }) => (
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: isActive
                        ? "rgba(255,255,255,0.15)"
                        : "transparent",
                      borderLeft: isActive
                        ? "4px solid #fff"
                        : "4px solid transparent",
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                )}
              </NavLink>
            ))}
          </Box>

          {/* Footer */}
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
        </Drawer>
      </Box>
    </Box>
  );
}

export default Navbar;
