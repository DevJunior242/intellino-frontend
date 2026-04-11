import React, { useState, useEffect } from "react";
import { Box, Paper, Tabs, Tab, Typography, Divider } from "@mui/material";
import MandatForm from "./section/MandatForm";
import PosteForm from "./section/PosteForm";
import PostesConfig from "./section/PostesConfig";
import BureauNomination from "./League/competion/BureauNomination";
import AddCandidat from "./section/AddCandidat";

export default function GovernanceSettings() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1a237e" }}
      >
        Paramètres de Gouvernance
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Gestion des Mandats (Cycles)" />
          <Tab label="Catalogue des Postes & Adjoints" />
          <Tab label="Bureau National" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <MandatForm />}
          {tabValue === 1 && <PostesConfig />}
          {tabValue === 2 && <BureauNomination />}
        </Box>
      </Paper>
    </Box>
  );
}
