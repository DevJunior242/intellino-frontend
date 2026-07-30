import { Box, darken, Grid } from "@mui/material";
import {
  Groups,
  School,
  PeopleAlt,
  Person,
  MonetizationOn,
  Star,
  Shield,
  AccountBalance,
  WarningAmber,
} from "@mui/icons-material";
import StartCard from "./StatCard";
import { useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import AbonnementActif from "../../Saas/pages/AbonnementActif";
import StatCard from "./StatCard";
import { blue, green, orange, yellow, purple, red } from "@mui/material/colors";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";
import { UseAuth } from "../../Api/AuthContext";
import OrganizationsManagement from "./OrganizationsManagement";

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    total_clubs: 0,
    total_leagues: 0,
    total_federations: 0,
    inactive_organizations: 0,
  });
  const [loading, setLoading] = useState(false);
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await Instance.get("/api/dashboard/stats");
      console.log(response);
      setStats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <ConfigSkeleton />;
  }
  return (
    <Box>
      <Grid
        container
        spacing={3}
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
          mx: 1,
          borderRadius: 2,
          p: 2,
          pb: 2,
        }}
        minHeight={50}
      >
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Clubs inscrits"
            value={stats.total_clubs}
            icon={<Groups />}
            color={green}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Ligues"
            value={stats.total_leagues}
            icon={<Shield />}
            color={purple}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Fédérations"
            value={stats.total_federations}
            icon={<AccountBalance />}
            color={blue}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Organisations désactivées"
            value={stats.inactive_organizations}
            icon={<WarningAmber />}
            color={red}
            subtitle="Voir le tableau ci-dessous"
          />
        </Grid>
      </Grid>

      <OrganizationsManagement />
    </Box>
  );
}

export default SuperAdminDashboard;
