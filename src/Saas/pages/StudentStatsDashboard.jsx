import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  People,
  MilitaryTech,
  EventAvailable,
} from "@mui/icons-material";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";

function StudentStatsDashboard() {
  const [stats, setStats] = useState(null);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [progressionHistory, setProgressionHistory] = useState([]);
  const [statsSummary, setStatsSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { activeId } = UseAuth();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get(
        `/api/student-stats?club_id=${activeId}`,
      );
      console.log(response);
      const data = response.data.data;
      const distribution = data.distribution || [];
      const history = data.history || [];
      const summary = data.summary || [];
      setGradeDistribution(distribution);
      setProgressionHistory(history);
      setStatsSummary(summary);

      console.log("Distribution:", distribution);
      setStats(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  if (loading) return <ConfigSkeleton />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats)
    return (
      <Typography align="center" mt={10}>
        Erreur chargement statistiques
      </Typography>
    );
  //statCard
  const StatCard = ({ title, value, icon, trend }) => (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        backgroundColor: "background.default",
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ p: 1, bgcolor: "rgba(0,0,0,0.03)", borderRadius: 2 }}>
            {icon}
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "#4caf50", mt: 1, display: "block" }}
        >
          {trend}
        </Typography>
      </CardContent>
    </Card>
  );
  // --- CONFIGURATION DE COULEUR POUR LES GRADES ---

  const gradeColorConfig = {
    "centure blanche": { color: "#f5f5f5" },
    "centure jaune": { color: "#FFEB3B" },
    "centure verte": { color: "#4CAF50" },
    "centure bleue": { color: "#2196F3" },
    "centure noire": { color: "#212121" },
    "centure rouge": { color: "#f44336" },
    "centure grise": { color: "#8884d8" },
    "centure orange": { color: "#ff9800" },
  };

  //config  icon de summury
  const configIcon = {
    "Total Élèves": <People color="primary" />,
    "Grades Décernés": <MilitaryTech color="secondary" />,
    "Taux de Passage": <TrendingUp sx={{ color: "#4caf50" }} />,
    "Dernière Promo": <EventAvailable color="info" />,
  };

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: "bold", fontSize: { xs: 24, md: 32 } }}
      >
        Tableau de Bord Statistiques
      </Typography>

      {/* --- SECTION 1 : KPI CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsSummary.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={item.title}
              value={item.value}
              icon={configIcon[item?.title] || <People color="primary" />}
              trend={item.trend}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* --- SECTION 2 : RÉPARTITION DES GRADES (PIE CHART) --- */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              height: 400,
              backgroundColor: "background.default",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Répartition par Grade
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      // fill={gradeColorConfig[entry?.name]?.color}
                      fill={
                        gradeColorConfig[entry?.name?.toLowerCase()]?.color ||
                        "#8884d8"
                      }
                      stroke="#ccc"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* --- SECTION 3 : ÉVOLUTION DES PROMOTIONS (BAR CHART) --- */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              height: 400,
              backgroundColor: "background.default",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Promotions des 5 derniers mois
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={progressionHistory}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar
                  dataKey="count"
                  fill="#3f51b5"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StudentStatsDashboard;
