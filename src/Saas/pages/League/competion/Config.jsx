import React, { useState } from "react";
import { Box, Tabs, Tab, useMediaQuery, useTheme, Paper } from "@mui/material";
import { useParams } from "react-router-dom";

// Icônes pour les onglets (optionnel)
import {
  Assessment as CriteriaIcon,
  BarChart as ScaleIcon,
  Settings as AdvancedIcon,
} from "@mui/icons-material";
import CompetitionManager from "../CompetitionManager";
import ConfigNotationCardDetails from "./ConfigNotationCardDetails";
import ConfigNotationPage from "./ConfigNotationPage";
import { UseAuth } from "../../../../Api/AuthContext";

export default function Config() {
  const theme = useTheme();
  const { activeRole } = UseAuth();
  const isAdmin = activeRole === "admin_league";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Détecte les écrans mobiles
  const [activeTab, setActiveTab] = useState(0);
  //   const { id } = useParams(); // Si tu as besoin de l'ID de la configuration

  // Gestion du changement d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Style pour les onglets (adapté mobile/desktop)
  const tabProps = {
    sx: {
      minHeight: "48px",
      "& .MuiTab-root": {
        minHeight: "48px",
        fontSize: isMobile ? "0.8rem" : "0.9rem",
        padding: isMobile ? "6px 8px" : "6px 16px",
      },
    },
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Paper
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        {/* En-tête (optionnel) */}
        <Box sx={{ mb: 2 }}>
          <h2>Configuration de la notation</h2>
        </Box>

        {/* Onglets (Tabs) */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Configuration de la notation"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            {...tabProps}
          >
            <Tab
              icon={<CriteriaIcon />}
              iconPosition="start"
              label={isMobile ? "Competitions" : "Compétitions"}
            />
            <Tab
              icon={<ScaleIcon />}
              iconPosition="start"
              label={isMobile ? "tatamis" : "Échelle de notation"}
            />
            {isAdmin && (
              <Tab
                icon={<AdvancedIcon />}
                iconPosition="start"
                label={isMobile ? "Param." : "Paramètres avancés"}
              />
            )}
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <CompetitionManager />}
          {activeTab === 1 && <ConfigNotationPage />}
          {activeTab === 2 && <ConfigNotationCardDetails />}
        </Box>
      </Paper>
    </Box>
  );
}
