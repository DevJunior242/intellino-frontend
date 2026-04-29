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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { UseAuth } from "../../Api/AuthContext";
const ContextSwitcher = () => {
  // On récupère activeId et activeType
  const { auth, activeId, switchPortal } = UseAuth();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Fusionner les deux listes avec une étiquette 'type'
  const clubs = (auth.clubs || []).map((c) => ({ ...c, type: "Club" }));
  const leagues = (auth.leagues || []).map((l) => ({ ...l, type: "Ligue" }));

  const allSpaces = [...clubs, ...leagues];

  if (allSpaces.length === 0) return null;

  // 2. Trouver l'espace actuellement sélectionné
  const currentSpace = allSpaces.find((s) => s.id === activeId) || allSpaces[0];
  const otherSpaces = allSpaces.filter((s) => s.id !== activeId);

  return (
    <Box sx={{ p: 2, position: "relative" }}>
      {/* Bouton Principal */}
      <Paper
        elevation={0}
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          bgcolor: "background.default",
          p: 1.5,
          cursor: "pointer",
          borderRadius: 2,
          border: "1px solid",
          borderColor:
            currentSpace?.type === "Ligue" ? "primary.main" : "divider", // Bordure différente pour la ligue
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor:
                currentSpace?.type === "Ligue"
                  ? "secondary.main"
                  : "primary.main",
              width: 32,
              height: 32,
            }}
          >
            {currentSpace?.type === "Ligue" ? (
              <AccountBalanceIcon fontSize="small" />
            ) : (
              <BusinessIcon fontSize="small" />
            )}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {currentSpace?.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              {currentSpace?.type === "Ligue" ? "Ligue" : "Club"} —{" "}
              {currentSpace?.role[0]?.replace("_", " ")}{" "}
            </Typography>
          </Box>
        </Box>
        <SwapHorizIcon fontSize="small" color="action" />
      </Paper>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && allSpaces.length > 1 && (
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
                backgroundColor: "background.paper",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  px: 2,
                  pt: 1,
                  display: "block",
                  color: "text.secondary",
                  lineHeight: 2,
                }}
              >
                Changer d'espace
              </Typography>
              <List sx={{ p: 0, maxHeight: 300, overflowY: "auto" }}>
                {otherSpaces.map((space) => (
                  <ListItem key={space.id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        switchPortal(space.id, space.type, space.role); // On passe le type !
                        setIsOpen(false);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {space.type === "Ligue" ? (
                          <AccountBalanceIcon
                            color="secondary"
                            fontSize="small"
                          />
                        ) : (
                          <BusinessIcon color="primary" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {space.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {space.type === "Ligue" ? "Ligue" : "Club"} —{" "}
                          {space.role}
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
