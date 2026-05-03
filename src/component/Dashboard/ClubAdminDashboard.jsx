import { Box, Grid, Typography } from "@mui/material";
import {
  green,
  blue,
  red,
  purple,
  orange,
  lightBlue,
  yellow,
} from "@mui/material/colors";
import {
  Groups,
  School,
  PeopleAlt,
  Person,
  MonetizationOn,
  Star,
  MoneyOff,
  TrendingUp,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import Barcharts from "./Admin/Barcharts";
// import AbonnementActif from "../../Saas/pages/AbonnementActif";
import { motion } from "framer-motion";
import { UseAuth } from "../../Api/AuthContext";
import RevenueChart from "../../Saas/pages/RevenueChart";
import Activity from "../../Saas/pages/ActivityFeed";
import Program from "../../Saas/pages/Program";
import StatCard from "./StatCard";
import DebtPage from "../../Saas/pages/DebtPage";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";
import ClubCount from "../../Saas/pages/ClubCount";
import ErrorBlock from "../../Saas/pages/ErrorBlock";
import QuickActions from "../../Saas/pages/QuickActions";
function ClubAdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_instructors: 0,
    total_parents: 0,
    total_secretaries: 0,
  });

  const { activeId } = UseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchStats = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await Instance.get(
        `/api/dashboard/stats?organisateur_id=${activeId}`,
      );
      console.log(response);
      setStats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
      setError("Erreur lors de la récupération des statistiques");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      fetchStats();
    }
  }, [activeId, fetchStats]);

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les statistiques"
        onRetry={fetchStats}
      />
    );
  return (
    <Box sx={{ mt: 1, px: 2 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Recettes (Mois)"
              value={`${stats.total_collected ? parseFloat(stats.total_collected).toLocaleString() : 0} XOF`}
              icon={<TrendingUp />}
              color={green}
              subtitle="Argent réellement encaissé"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Dettes Totales"
              value={`${stats.total_debts ? parseFloat(stats.total_debts).toLocaleString() : 0} XOF`}
              icon={<MoneyOff />}
              color={red}
              subtitle="Reste à recouvrer"
            />
          </Grid>
          {/* SECTION EFFECTIFS */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Élèves Actifs"
              value={stats.total_students}
              icon={<School />}
              color={blue}
              subtitle="Inscrits dans le club"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Parents"
              value={stats.total_parents}
              icon={<Person />}
              color={orange}
              subtitle="Parents inscrits dans le club"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Secretaires"
              value={stats.total_secretaries}
              icon={<PeopleAlt />}
              color={purple}
              subtitle="Secretaires inscrits dans le club"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Instructeurs"
              value={stats.total_instructors}
              icon={<PeopleAlt />}
              color={yellow}
              subtitle="Instructeurs inscrits dans le club"
            />
          </Grid>
        </Grid>
      </motion.div>

      <Box
        component={"div"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        sx={{
          marginTop: "24px",
          display: "flex",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: "16px",
        }}
      ></Box>

      <Box sx={{ mt: 3, mb: 2 }}>
        <Program activeId={activeId} role="admin" />
        <Activity />
        <QuickActions />
      </Box>
    </Box>
  );
}

export default ClubAdminDashboard;
