import { Box } from "@mui/material";
import DashboardStats from "../../../component/Dashboard/DashboardStats";

// Miroir de component/League/DashboardLeague.jsx : la route "stats" doit
// passer par GlobalRole (via DashboardStats) pour afficher le bon dashboard
// selon le rôle réel (admin/dtn -> AdminFederationDashboard, arbitre ->
// ArbitreDashboard) — avant ce composant, la route pointait directement sur
// <AdminFederationDashboard />, affichée à tout le monde y compris aux
// arbitres de fédération.
const DashboardFederation = () => {
  return (
    <Box sx={{ py: 2, px: 2 }}>
      <DashboardStats />
    </Box>
  );
};

export default DashboardFederation;
