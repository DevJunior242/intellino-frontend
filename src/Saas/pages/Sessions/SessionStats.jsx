import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import AttendanceIndex from "../../pages/AttendanceIndex";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";

export default function SessionStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { activeClubId } = UseAuth();

  const fetchStats = useCallback(async () => {
    if (!activeClubId) return;
    setLoading(true);
    setError("");
    try {
      const response = await Instance.get(
        `/api/sessions/session-stats?club_id=${activeClubId}`,
      );
      console.log(response);
      setStats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
      setError("Erreur lors de la récupération des statistiques");
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const StatCard = ({ title, value }) => (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ backgroundColor: "background.default" }}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) return <ConfigSkeleton />;

  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les statistiques"
        onRetry={fetchStats}
      />
    );

  if (!stats)
    return (
      <Typography align="center" mt={10}>
        Erreur chargement statistiques
      </Typography>
    );

  return (
    <Box p={4} sx={{ backgroundColor: "background.default" }}>
      {/* SECTION SESSIONS */}
      <Typography variant="h6" mb={2}>
        Statistiques Sessions
      </Typography>

      <Grid container spacing={2} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total" value={stats.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Programmées" value={stats.scheduled} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="En cours" value={stats.ongoing} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Terminées" value={stats.completed} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Annulées" value={stats.cancelled} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Reportées" value={stats.postponed} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Fiabilité %" value={stats.reliability_rate + "%"} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Taux annulation %" value={stats.cancel_rate + "%"} />
        </Grid>
      </Grid>

      {/* SECTION ANALYTICS */}
      <Typography variant="h6" mb={2}>
        Analytics avancées
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Sessions réellement en retard"
            value={stats.late_sessions}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            title="Durée moyenne réelle (min)"
            value={
              (stats.avg_duration_minutes ?? 0) +
              " min" +
              ((stats.avg_duration_minutes ?? 0) > 1 ? "s" : "")
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            title="Taux remplacement instructeur"
            value={(stats.replacement_rate ?? 0) + "%"}
          />
        </Grid>
      </Grid>

      <AttendanceIndex />
    </Box>
  );
}
