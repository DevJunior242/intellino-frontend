import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Avatar,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PublicIcon from "@mui/icons-material/Public";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { UseAuth } from "../../Api/AuthContext";

// Centralise la résolution icône/couleur par type d'organisation,
// pour ne jamais avoir à dupliquer la condition à plusieurs endroits du JSX.
const SPACE_VISUALS = {
  Federation: { Icon: PublicIcon, color: "warning.main" },
  Ligue: { Icon: AccountBalanceIcon, color: "secondary.main" },
  Club: { Icon: BusinessIcon, color: "primary.main" },
};

function getSpaceVisual(type) {
  return SPACE_VISUALS[type] || SPACE_VISUALS.Club;
}

const ContextSwitcher = ({ isCollapsed = false }) => {
  const { auth, activeId, switchPortal } = UseAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Fusionner les clubs, ligues et fédérations avec un type
  const clubs = (auth.clubs || []).map((c) => ({ ...c, type: "Club" }));
  const leagues = (auth.leagues || []).map((l) => ({ ...l, type: "Ligue" }));
  const federations = (auth.federations || []).map((f) => ({
    ...f,
    type: "Federation",
  }));
  const allSpaces = [...federations, ...leagues, ...clubs];

  if (allSpaces.length === 0) return null;

  // Trouver l'espace actuellement sélectionné
  const currentSpace = allSpaces.find((s) => s.id === activeId) || allSpaces[0];
  const currentVisual = getSpaceVisual(currentSpace?.type);
  const CurrentIcon = currentVisual.Icon;

  return (
    <Box sx={{ p: isCollapsed ? 1 : 2, position: "relative" }}>
      {/* Bouton principal */}
      <Tooltip
        title={
          isCollapsed ? `${currentSpace?.name} (${currentSpace?.type})` : ""
        }
        placement="right"
      >
        <Paper
          elevation={0}
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            bgcolor: "background.default",
            p: isCollapsed ? 0.5 : 1.5,
            cursor: "pointer",
            borderRadius: 2,
            border: "1px solid",
            borderColor:
              currentSpace?.type === "Ligue" ? "primary.main" : "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : 1.5,
              width: "100%",
            }}
          >
            <Avatar
              sx={{
                bgcolor: currentVisual.color,
                width: isCollapsed ? 32 : 32,
                height: isCollapsed ? 32 : 32,
              }}
            >
              <CurrentIcon fontSize="small" />
            </Avatar>

            {!isCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                  {currentSpace?.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  {currentSpace?.type} : {currentSpace?.role}
                </Typography>
              </Box>
            )}

            {!isCollapsed && <SwapHorizIcon fontSize="small" color="action" />}
          </Box>
        </Paper>
      </Tooltip>

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
              left: isCollapsed ? 0 : 16,
              right: isCollapsed ? 0 : 16,
              zIndex: 1000,
              minWidth: isCollapsed ? 200 : "auto", // Largeur minimale pour éviter un menu trop étroit
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
                {allSpaces.map((space) => {
                  const visual = getSpaceVisual(space.type);
                  const SpaceIcon = visual.Icon;
                  return (
                    <ListItem key={space.id} disablePadding>
                      <ListItemButton
                        selected={space.id === activeId}
                        onClick={() => {
                          switchPortal(space.id, space.type, space.role);
                          setIsOpen(false);
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <SpaceIcon
                            sx={{ color: visual.color }}
                            fontSize="small"
                          />
                        </ListItemIcon>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {space.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {space.type} — {space.role}
                          </Typography>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ContextSwitcher;
