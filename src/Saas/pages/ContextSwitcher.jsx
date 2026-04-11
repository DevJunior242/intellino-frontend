import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Divider,
  Avatar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import BusinessIcon from "@mui/icons-material/Business";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { UseAuth } from "../../Api/AuthContext";

const ContextSwitcher = () => {
  const { auth, activeClubId, switchRole: switchContext } = UseAuth();
  const [isOpen, setIsOpen] = useState(false);
  console.log("auth switch:", auth);
  // Séparer le club actif des autres
  const memberships = auth.memberships || [];
  console.log("memberships:", memberships);
  if (memberships.length === 0) return null;
  const currentMembership =
    memberships.find((m) => m.id === activeClubId) || memberships[0];
  console.log("currentMembership:", currentMembership);
  const otherClubs = memberships.filter((m) => m.id !== activeClubId);

  console.log("otherClubs :", otherClubs);
  return (
    <Box sx={{ p: 2, position: "relative" }}>
      {/* Bouton Principal : Affiche le club actuel */}
      <Paper
        elevation={0}
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          bgcolor: "background.default",
          p: 1.5,
          cursor: "pointer",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <BusinessIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {currentMembership?.name ?? "Club Inconnu"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentMembership?.role}
            </Typography>
          </Box>
        </Box>
        <SwapHorizIcon fontSize="small" color="action" />
      </Paper>

      {/* Menu déroulant animé avec Framer Motion */}
      <AnimatePresence>
        {isOpen && memberships.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 5 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Paper
              elevation={4}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "background.default",
              }}
            >
              <Typography
                variant="overline"
                sx={{ px: 2, pt: 1, color: "text.secondary" }}
              >
                Changer d'espace
              </Typography>
              <List sx={{ p: 0 }}>
                {otherClubs.map((club) => (
                  <ListItem key={club.id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        switchContext(club.id, club.role);
                        setIsOpen(false);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <BusinessIcon fontSize="small" />
                      </ListItemIcon>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {club.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {club.role}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ContextSwitcher;
