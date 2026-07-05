import React, { useState } from "react";
import { Box, Tabs, Tab, useMediaQuery, useTheme, Paper } from "@mui/material";

// Icônes pour les onglets (optionnel)
import {
  Assessment as CriteriaIcon,
  BarChart as ScaleIcon,
  Settings as AdvancedIcon,
  Assessment,
  People,
} from "@mui/icons-material";
import CompetitionManager from "../CompetitionManager";
import ConfigNotationPage from "./ConfigNotationPage";
import { UseAuth } from "../../../../Api/AuthContext";
import ConfigNotationCardDetails from "./ConfigNotationCardDetails";
import Arbitres from "../Arbitres";
import AdminCompetitionManagement from "./AdminCompetitionManagement";

export default function Config() {
  const theme = useTheme();
  const { activeRole } = UseAuth();
  const Role = activeRole?.toLowerCase();
  const isAdmin = Role === "admin";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState("competitions");

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
            {" "}
            <Tab
              value="competitions"
              icon={<CriteriaIcon />}
              iconPosition="start"
              label={isMobile ? "Competitions" : "Compétitions"}
            />
            {isAdmin ? (
              <Tab
                value="arbitrages"
                icon={<People />}
                iconPosition="start"
                label="Arbitres"
              />
            ) : null}
            {isAdmin ? (
              <Tab
                value="athletes"
                icon={<Assessment />}
                iconPosition="start"
                label="Athlètes"
              />
            ) : null}
            {isAdmin ? (
              <Tab
                value="notation"
                icon={<ScaleIcon />}
                iconPosition="start"
                label="Tatamis"
              />
            ) : null}
            <Tab
              value="advanced"
              icon={<AdvancedIcon />}
              iconPosition="start"
              label={isMobile ? "Jury" : "Jury"}
            />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <Box sx={{ mt: 2 }}>
          {activeTab === "competitions" && <CompetitionManager />}
          {activeTab === "arbitrages" && isAdmin && <Arbitres />}
          {activeTab === "athletes" && isAdmin && (
            <AdminCompetitionManagement />
          )}
          {activeTab === "notation" && isAdmin && <ConfigNotationPage />}
          {activeTab === "advanced" && <ConfigNotationCardDetails />}
        </Box>
      </Paper>
    </Box>
  );
}
