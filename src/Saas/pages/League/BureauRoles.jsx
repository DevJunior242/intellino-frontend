import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Stack,
  Button,
  Avatar,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import { alpha, useTheme } from "@mui/material/styles";
import MemberLeagueForm from "./MemberLeagueForm";
import Membres from "./Membres";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";

export default function BureauRoles() {
  const muiTheme = useTheme();
  // Couleurs dérivées du thème actif (au lieu de valeurs fixes) pour
  // s'adapter au clair/sombre des dashboards ligue/fédération.
  const theme = {
    bg: muiTheme.palette.background.default,
    card: muiTheme.palette.background.paper,
    textMain: muiTheme.palette.text.primary,
    textSecondary: muiTheme.palette.text.secondary,
    accent: muiTheme.palette.primary.main,
    chipBg: alpha(muiTheme.palette.text.primary, 0.05),
  };
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { activeId, activeType } = UseAuth();
  const getMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get(
        `/api/membres/league?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log(response);
      setMembers(response.data.members || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [activeId, activeType]);

  useEffect(() => {
    getMembers();
  }, [getMembers]);

  return (
    <Box sx={{ p: 4, bgcolor: theme.bg, minHeight: "100vh" }}>
      {/* Titre de la page */}
      <Typography
        variant="h5"
        sx={{ color: theme.textMain, fontWeight: 700, mb: 4 }}
      >
        Bureau & rôles
      </Typography>

      {/* Boutons d'action supérieurs */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          sx={{
            color: "text.primary",
            borderColor: "divider",
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            py: 1,
            "&:hover": {
              borderColor: "text.primary",
              bgcolor: "action.hover",
            },
          }}
          onClick={handleOpen}
        >
          Ajouter membre
        </Button>
        <Button
          variant="outlined"
          sx={{
            color: "text.primary",
            borderColor: "divider",
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            "&:hover": {
              borderColor: "text.primary",
              bgcolor: "action.hover",
            },
          }}
        >
          Gérer les rôles
        </Button>
      </Stack>
      <Box sx={{ p: 4, bgcolor: theme.bg, minHeight: "100vh" }}>
        <Membres members={members} loading={loading} />
        <MemberLeagueForm
          open={open}
          handleClose={handleClose}
          getMembers={getMembers}
        />
      </Box>
    </Box>
  );
}
