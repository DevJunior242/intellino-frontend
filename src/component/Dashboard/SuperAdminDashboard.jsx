import { Box, Grid } from "@mui/material";
import {
  Groups,
  School,
  PeopleAlt,
  Person,
  MonetizationOn,
  Star,
} from "@mui/icons-material";
import StartCard from "./StatCard";
import { useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import AbonnementActif from "../../Saas/pages/AbonnementActif";

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    total_clubs: 0,
    total_students: 0,
    total_instructors: 0,
    total_parents: 0,
    active_subscriptions: 0,
    total_subscriptions: 0,
    total_revenue_mensuel: 0,
    total_revenue_annuel: 0,
    total_revenue: 0,
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
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <PulseLoader />
      </Box>
    );
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
          <StartCard
            title="Clubs inscrits"
            value={stats.total_clubs}
            icon={<Groups />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Élèves"
            value={stats.total_students}
            icon={<School />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Instructors"
            value={stats.total_instructors}
            icon={<PeopleAlt />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Parents"
            value={stats.total_parents}
            icon={<Person />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Abonnements actifs"
            value={stats.active_subscriptions}
            icon={<MonetizationOn />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Total des abonnements"
            value={stats.total_subscriptions}
            icon={<MonetizationOn />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Revenu mensuel"
            value={stats.total_revenue_mensuel}
            icon={<MonetizationOn />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Revenu annuel"
            value={stats.total_revenue_annuel}
            icon={<MonetizationOn />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Revenu total"
            value={stats.total_revenue}
            icon={<MonetizationOn />}
          />
        </Grid>
      </Grid>
      <Box mt={1} mb={2}>
        <AbonnementActif />
      </Box>
    </Box>
  );
}

export default SuperAdminDashboard;
