import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Button,
  Chip,
  LinearProgress,
  Avatar,
} from "@mui/material";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorBlock from "../ErrorBlock";
import ConfigSkeleton from "../ConfigSkeleton";
import VitalityGauge from "./VitalityGauge";

const theme = {
  bg: "#1a1d21",
  paper: "#212529",
  card: "#2c3035",
  textMain: "#ffffff",
  textSecondary: "#8b90a0",
  accent: "#e8c84a",
  success: "#4caf50",
  warning: "#f44336",
  info: "#2196f3",
};

// --- COMPOSANT : Stat Card du haut ---
const StatCard = ({ title, value, detail, detailColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      bgcolor: theme.paper,
      borderRadius: 4,
      flex: 1,
      border: "1px solid rgba(255,255,255,0.05)",
    }}
  >
    <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 1.5 }}>
      {title}
    </Typography>
    <Typography variant="h3" sx={{ color: theme.textMain, fontWeight: 800 }}>
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{ color: detailColor || theme.textSecondary, fontWeight: 500 }}
    >
      {detail}
    </Typography>
  </Paper>
);

// --- COMPOSANT : Barre de répartition des grades ---
const GradeProgress = ({ label, value, progressColor }) => (
  <Box sx={{ mb: 2.5 }}>
    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ color: theme.textMain, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.textSecondary }}>
        {value}%
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 6,
        borderRadius: 3,
        bgcolor: "#1a1d21",
        "& .MuiLinearProgress-bar": { bgcolor: progressColor || theme.info },
      }}
    />
  </Box>
);

export default function GradesExamens() {
  const [stats, setStats] = useState({
    total_grades: 0,
    total_examens: 0,
    taux: 0,
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
        `/api/dashboard/league/exmenstates?organisateur_id=${activeId}&organisateur_type=Ligue`,
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
  // — FORMAT DU DATE —
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Aucune session prévue")
      return dateString;

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };
  //
  const displayProgression = (value) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${Math.round(value)}% vs préc.`;
  };

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error) return <ErrorBlock message={error} onRetry={fetchStats} />;
  return (
    <Box sx={{ p: 4, bgcolor: theme.bg, minHeight: "100vh" }}>
      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography
          variant="h5"
          sx={{ color: theme.textMain, fontWeight: 700 }}
        >
          Grades & examens de grades
        </Typography>
        <Chip
          label="Saison 2025-2026"
          sx={{ bgcolor: theme.card, color: theme.success, fontWeight: 600 }}
        />
      </Stack>

      {/* STATS DU HAUT */}
      <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
        <StatCard
          title="Grades décernés cette saison"
          value={stats.grades_decernes}
          detail={displayProgression(stats.progression)}
          detailColor={theme.success}
        />
        <StatCard
          title="Sessions d'examen"
          value={stats.sessions_count}
          detail={`${stats.sessions_a_venir} à venir`}
          detailColor={theme.success}
        />
        <StatCard
          title="Taux de réussite"
          value={
            stats.taux_reussite !== undefined
              ? `${stats.taux_reussite}%`
              : "chargement..."
          }
          detail="Moyenne saison"
          detailColor={theme.success}
        />
      </Stack>

      <Grid container spacing={3}>
        {/* SECTION : PROCHAINE SESSION */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: theme.paper,
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: theme.textMain, fontWeight: 600, mb: 1 }}
            >
              Prochaine session d'examen — {formatDate(stats.next_exam_date)}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Chip
                label="Salle omnisports ouagadougou"
                size="small"
                sx={{ bgcolor: "#e3f2fd", color: "#0d47a1" }}
              />
              <Chip
                label={`${stats.next_exam_candidates} candidats`}
                size="small"
                sx={{ bgcolor: theme.card, color: theme.textSecondary }}
              />
              <Chip
                label={stats.next_examen_grade}
                size="small"
                sx={{ bgcolor: "#fff3e0", color: "#e65100" }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* SECTION : RÉPARTITION */}
        <Grid item xs={12} md={4}>
          <VitalityGauge />
        </Grid>
      </Grid>
    </Box>
  );
}
