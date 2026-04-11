import React, { useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import {
  Box,
   Button,  
  Tabs,
  Tab,
  Paper,
  Typography,
} from "@mui/material";
import MemberList from "./MemberList";
import AdminRegister from "../AdminRegister";

 
function Details() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3,mt:4 }}>
      <Paper sx={{ p: 3, mt: 6, mb: 3 }}>
        <Typography variant="h4"> Liste des membres du club</Typography>
      </Paper>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Listes" />
        <Tab label="Inscriptions" />
      </Tabs>

      {/* ACTIONS */}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        {tab === 0 && (
          <Button
            variant="contained"
            
          >
            Ajouter
          </Button>
        )}

        {tab === 1 && (
         <Typography variant="h4" sx={{ mt: 10, fontWeight: "bold" }}>
           s'inscrire nouveau membre à mon club
          </Typography>
         )}
      </Box>

      {/* CONTENU */}
      {tab === 0 && <MemberList />}
      {tab === 1 && <AdminRegister />}
    </Box>
  );
}

export default Details;
