import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
  Container,
} from "@mui/material";
import { Delete, ExitToApp, Save, Security, Update } from "@mui/icons-material";
import Profile from "../../Saas/pages/Profile";
import MeClub from "./MeClub";
import UpdatePassword from "./UpdatePassword";
import DeleAccount from "./DeleAccount";
import StoreSaison from "./StoreSaison";
import TransferMandateForm from "../../Saas/pages/League/Mandat/TransferMandateForm";
import { UseAuth } from "../../Api/AuthContext";

const AccountSettings = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const { activeRole, activeType, currentClub, currentLeague } = UseAuth();

  const authorized = activeRole?.toLowerCase() === "admin";

  // Un club rattaché à une ligue, ou une ligue rattachée à une fédération,
  // hérite automatiquement de la saison de son parent (voir
  // ResolvesActiveSaison côté backend) — seule l'entité indépendante peut
  // gérer ses propres saisons.
  const isIndependentOrg =
    activeType === "Club"
      ? !currentClub?.league_id
      : activeType === "Ligue"
        ? !currentLeague?.federation_id
        : true; // Federation : toujours indépendante

  const authorizedToAccessSaisons = authorized && isIndependentOrg;
  // 1. Gestion des onglets
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mon Compte
      </Typography>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 2,
          backgroundColor: "#020224",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="scrollable tabs"
          sx={{
            width: "100%",
            "& .MuiTabs-flexContainer": {
              justifyContent: "center",
            },
            "& .MuiTabs-indicator": { height: 3 },
            "& .MuiTab-root": {
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            },
            "& .MuiTab-root.Mui-selected": {
              color: "#fff",
            },
          }}
        >
          <Tab label="Profil Public" />
          <Tab label="Sécurité & Réglages" />
          {authorizedToAccessSaisons && <Tab label="Saisons" />}
          {/* {authorizedToAccessSaisons && <Tab label="Transfert Mandat" />} */}
        </Tabs>
      </Box>

      {/* --- ONGLET 1 : PROFIL (IDENTITÉ) --- */}
      {tabIndex === 0 && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Profile />
        </Box>
      )}

      {/* --- ONGLET 2 : SETTINGS (SÉCURITÉ) --- */}
      {tabIndex === 1 && (
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: { xs: "column", md: "row" },
            pt: 5,
            minHeight: "100px",
            width: "100%",
          }}
        >
          <UpdatePassword />

          <DeleAccount />
        </Container>
      )}

      {authorizedToAccessSaisons && (
        <>
          {/* --- ONGLET 4 : SAISONS (APPARTENANCE) --- */}
          {tabIndex === 2 && (
            <Box sx={{ p: 2 }}>
              <StoreSaison />
            </Box>
          )}
          {/* --- ONGLET 5 : MANDAT (APPARTENANCE) --- */}
          {/* {tabIndex === 3 && (
            <Box>
              <TransferMandateForm />
            </Box>
          )} */}
        </>
      )}
    </Box>
  );
};

export default AccountSettings;
