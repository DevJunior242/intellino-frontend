import {
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import { Link } from "react-router-dom";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import StudentForm from "./StudentForm";
import StudentList from "./StudentList";
import StudentGradCreate from "../StudentGradCreate";

function StudentDetails() {
  const { activeRole } = UseAuth();

  const allowAccess = [
    "admin_club",
    "instructeur",
    "secretaire",
    "super_admin",
  ].includes(activeRole);
  const tabs = [
    ...(allowAccess ? [{ label: "Inscriptions", key: "inscriptions" }] : []),

    { label: "Listes des eleves", key: "listes des eleves" },
    { label: "Grades", key: "grades" },
  ];
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ p: 3 }}>
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

        {tabs[tab]?.key === "inscriptions" && <StudentForm />}
        {tabs[tab]?.key === "listes des eleves" && <StudentList />}
        {tabs[tab]?.key === "grades" && <StudentGradCreate />}
      </Box>
    </Box>
  );
}

export default StudentDetails;
