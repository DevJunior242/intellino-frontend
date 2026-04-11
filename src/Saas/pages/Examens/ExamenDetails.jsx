import {
  Box,
  Tab,
  Tabs,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import { Link, useParams } from "react-router-dom";
import CandidatsGrid from "./CandidatsGrid";
import StoreEnchainement from "./StoreEnchainement";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Note from "./Note";
import ExamenManage from "./ExamenManage";
import { useAllowAccess } from "../../../Hook/useAllowAccess";

function ExamenDetails() {
  const { examenId } = useParams();
  const { allowAccess } = useAllowAccess();
  const tabs = [
    ...(allowAccess
      ? [
          { label: " Gestion de l'Examens", key: "examens" },
          { label: "Enchainements", key: "enchainements" },
        ]
      : []),
    { label: "Candidats", key: "candidats" },
    { label: "Notes", key: "notes" },
  ];
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box sx={{ p: 3, mt: 0 }}>
        <Button
          component={Link}
          to="/examen"
          sx={{ fontSize: { xs: 8, md: 16, textTransform: "none" } }}
        >
          retour
        </Button>
        {/* TABS */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            gap: 2,
            backgroundColor: "#020224",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
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
            {tabs.map((tab) => (
              <Tab key={tab.key} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* ACTIONS */}
        {allowAccess && (
          <Box
            sx={{
              mb: 2,
              display: "flex",
              gap: 2,
              backgroundColor: "background.default",
            }}
          >
            {tab === 1 && (
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  mt: 0,
                  display: "flex",
                  backgroundColor: "background.default",
                }}
              >
                <IconButton>
                  <WarningAmberOutlinedIcon
                    sx={{ color: "warning.main", fontSize: 50 }}
                  />
                </IconButton>

                <Typography
                  variant="body1"
                  component="p"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    fontSize: { xs: 8, md: 16 },
                  }}
                >
                  Les enchaînements représentent les éléments qui seront évalués
                  lors de cet examen. Nous vous conseillons de les créer avant
                  toute notation, afin d’assurer une évaluation claire et
                  équitable pour tous les candidats
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* CONTENU */}
        {tabs[tab]?.key === "examens" && <ExamenManage examenId={examenId} />}
        {tabs[tab]?.key === "enchainements" && (
          <StoreEnchainement examenId={examenId} />
        )}
        {tabs[tab]?.key === "candidats" && (
          <CandidatsGrid examenId={examenId} />
        )}
        {tabs[tab]?.key === "notes" && <Note />}
      </Box>
    </Box>
  );
}

export default ExamenDetails;
