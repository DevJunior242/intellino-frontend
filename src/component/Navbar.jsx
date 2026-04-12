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
} from "@mui/material";
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
      <List sx={{ display: { xs: "none", md: "flex" }, gap: 2, ml: 4 }}>
        {filteredItems.map((item) => (
          <ListItem
            key={item.title}
            sx={{
              display: "inline",
              width: "auto",
              p: 1,
              cursor: "pointer",
            }}
          >
            <NavLink
              to={item.href}
              style={{
                textDecoration: "none",
                color: "white",
              }}
            >
              {item.title}
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

        <Menu
          anchorReference="none"
          open={openMenu}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              maxHeight: "100vh",
              maxWidth: "100vw",
              backgroundColor: "background.default",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            },
          }}
        >
          <Button
            onClick={handleCloseMenu}
            sx={{ fontSize: 50, fontWeight: "bold", color: "#0606CF" }}
          >
            x
          </Button>

          {filteredItems.map((item) => (
            <MenuItem key={item.title} onClick={handleCloseMenu}>
              <NavLink
                to={item.href}
                style={({ isActive }) => ({
                  color: isActive ? "#FD1D1D" : "#141499",
                  textDecoration: isActive ? "underline" : "none",
                  fontSize: 24,
                })}
              >
                {item.title}
              </NavLink>
            </MenuItem>
          ))}

          {/* Mobile Account */}
          {auth && (
            <Box sx={{ mt: 4 }}>
              <Tooltip title="Account settings">
                <IconButton onClick={handleClickAccount} size="small">
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.name?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Menu>
      </Box>
    </Box>
  );
}

export default Navbar;
