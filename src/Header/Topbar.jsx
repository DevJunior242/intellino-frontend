import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  LightModeOutlined,
  DarkModeOutlined,
  AccountCircle,
  Logout,
  Settings,
} from "@mui/icons-material";
import { UseAuth } from "../Api/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

const TopBar = ({ setMode }) => {
  const theme = useTheme();
  const { auth, logout } = UseAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 250px)` },
        ml: { sm: `250px` },
        backgroundColor: 'background.default',
        boxShadow: "none",
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: 1000,
      }}
    >
   
      <Toolbar>
        
         <Box sx={{ flexGrow: 1 }} />
       
        <Box display="flex" alignItems="center">
          <ThemeToggle />

          <Tooltip title="Compte">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <AccountCircle fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
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
          
          <MenuItem onClick={() => navigate("/settings")}>
            <Settings sx={{ mr: 1 }} />
            Paramètres
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Déconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
