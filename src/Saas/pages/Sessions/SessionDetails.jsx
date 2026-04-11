import { Box, Tab, Tabs, Button } from "@mui/material";
import React, { useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import { Link, useParams } from "react-router-dom";
import SessionShow from "./SessionShow";
import CourseManagement from "./CourseManagement";
import SessionInfos from "./SessionInfos";

function SessionDetails() {
  const [tab, setTab] = useState(0);

  const { sessionId } = useParams();
  console.log(sessionId);

  const { activeRole } = UseAuth();

  const allowAccess = [
    "admin_club",
    "instructeur",
    "secretaire",
    "super_admin",
  ].includes(activeRole);
  const tabs = [
    ...(allowAccess ? [{ label: "Gestion des cours", key: "cours" }] : []),

    { label: "Listes des presences", key: "sessions" },
    { label: "Infos", key: "informations" },
  ];

  return (
    <Box>
      <Box sx={{ p: 3, mt: 0 }}>
        <Button sx={{ fontSize: { xs: 8, md: 16, textTransform: "none" } }}>
          <Link to="/dashboard/session/list">retour</Link>
        </Button>
        {/* TABS */}
        <Box
          sx={{ mb: 2, display: "flex", gap: 2, backgroundColor: "#020224" }}
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

        {/* CONTENU */}

        {tabs[tab]?.key === "cours" && (
          <CourseManagement sessionId={sessionId} />
        )}
        {tabs[tab]?.key === "sessions" && <SessionShow />}
        {tabs[tab]?.key === "informations" && (
          <SessionInfos sessionId={sessionId} />
        )}
      </Box>
    </Box>
  );
}

export default SessionDetails;
