import { useState } from "react";
import { List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function DrawerMenu() {
  const [openStats, setOpenStats] = useState(false);
  const navigate = useNavigate();

  return (
    <List sx={{ width: "100%", bgcolor: "#1a1d23", color: "white" }}>
      <ListItemButton onClick={() => setOpenStats(!openStats)}>
        <ListItemText primary="Statistiques" color="white" />
        {openStats ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={openStats} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }} onClick={() => navigate("payments")}>
            <ListItemText primary="paiements" />
          </ListItemButton>
          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => navigate("sessions-stats")}
          >
            <ListItemText primary="Sessions" />
          </ListItemButton>
          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => navigate("examens-stats")}
          >
            <ListItemText primary="Examens" />
          </ListItemButton>
          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => navigate("students-stats")}
          >
            <ListItemText primary="Elèves" />
          </ListItemButton>
          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => navigate("grades-history")}
          >
            <ListItemText primary="historique des grades" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
}
