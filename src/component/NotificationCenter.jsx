import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Menu,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button,
  Box,
  Checkbox,
  ListItemIcon,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { Instance } from "../Api/Axios";
import { UseAuth } from "../Api/AuthContext";

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const { auth } = UseAuth();
  useEffect(() => {
    if (!auth?.isLogin) return;
    let interval;

    const fetchNotifications = async () => {
      try {
        const res = await Instance.get("/api/notifications");
        setNotifications(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    const startPolling = () => {
      interval = setInterval(fetchNotifications, 500000000);
    };

    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };

    if (document.visibilityState === "visible") {
      fetchNotifications();
      startPolling();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [auth?.isLogin]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedIds([]); // On reset la sélection à la fermeture
  };

  // Toggle la sélection d'une checkbox
  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Marquer la sélection comme lue (Façon 1xbet)
  const markSelectedAsRead = async () => {
    if (selectedIds.length === 0) return;
    await Instance.post("/api/notifications/mark-read", { ids: selectedIds });
    setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  // Tout marquer comme lu
  const markAllAsRead = async () => {
    const allIds = notifications.map((n) => n.id);
    await Instance.post("/api/notifications/mark-read", { ids: allIds });
    setNotifications([]);
    handleClose();
  };

  const handleNotificationClick = async (notif) => {
    try {
      await Instance.post("/api/notifications/mark-read", { ids: [notif.id] });

      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));

      handleClose();
      navigate(notif.data.url);
    } catch (error) {
      console.error("Erreur lors du marquage:", error);
      navigate(notif.data.url);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          position: "relative",
          cursor: "pointer",
          color: "#555",
          transition: "all 0.3s ease",
          "&:hover": {
            color: "#1976d2",
            bgcolor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "background.default",
          },
          width: 420,
          maxHeight: 500,
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "background.default",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications ({notifications.length})
          </Typography>
          <Button size="small" onClick={markAllAsRead}>
            Tout lire
          </Button>
        </Box>

        <Divider />

        {selectedIds.length > 0 && (
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: "action.hover",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption">
              {selectedIds.length} sélectionné(s)
            </Typography>
            <Button size="small" color="primary" onClick={markSelectedAsRead}>
              Marquer comme lu
            </Button>
          </Box>
        )}

        <List sx={{ p: 0, bgcolor: "background.default" }}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <ListItem
                key={notif.id}
                disablePadding
                sx={{ borderBottom: "1px solid #f0f0f0" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <ListItemText
                    sx={{ pl: 2, py: 1 }}
                    primary={notif.data.title}
                    secondary={notif.data.message}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: "bold",
                    }}
                  />
                  {/* date */}
                </Box>
                <Checkbox
                  sx={{ mx: 1 }}
                  edge="end"
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggle(notif.id);
                  }}
                  checked={selectedIds.includes(notif.id)}
                />
              </ListItem>
            ))
          ) : (
            <Typography
              sx={{ p: 3, textAlign: "center" }}
              color="textSecondary"
            >
              Aucune notification
            </Typography>
          )}
        </List>
      </Menu>
    </>
  );
};
export default NotificationCenter;
