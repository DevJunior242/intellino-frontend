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
import MemberLeagueForm from "./MemberLeagueForm";
import Membres from "./Membres";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";

// Couleurs exactes de ton interface
const theme = {
  bg: "#1a1d21",
  card: "#2c3035",
  textMain: "#ffffff",
  textSecondary: "#8b90a0",
  accent: "#e8c84a", // Jaune
  chipBg: "rgba(255, 255, 255, 0.05)",
};

export default function BureauRoles() {
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
            color: "#fff",
            borderColor: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            py: 1,
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(255,255,255,0.05)",
            },
          }}
          onClick={handleOpen}
        >
          Ajouter membre
        </Button>
        <Button
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(255,255,255,0.05)",
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
