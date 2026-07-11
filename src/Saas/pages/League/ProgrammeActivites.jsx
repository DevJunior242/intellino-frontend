import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  LinearProgress,
  Stack,
  Chip,
  Avatar,
  IconButton,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useTheme } from "@mui/material/styles";
import { Instance } from "../../../Api/Axios";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";

// Couleurs dérivées du thème actif (au lieu de valeurs fixes) pour
// s'adapter au clair/sombre des dashboards ligue/fédération.
const useLocalTheme = () => {
  const muiTheme = useTheme();
  return {
    bg: muiTheme.palette.background.default,
    paper: muiTheme.palette.background.paper,
    card: muiTheme.palette.background.paper,
    textMain: muiTheme.palette.text.primary,
    textSecondary: muiTheme.palette.text.secondary,
    accent: muiTheme.palette.primary.main,
    success: muiTheme.palette.success.main,
    info: muiTheme.palette.info.main,
    warning: muiTheme.palette.error.main,
  };
};

const getCategoryColumn = (theme) => ({
  realisee: { title: "RÉALISÉES", color: theme.success },
  en_cours: { title: "EN COURS", color: theme.accent },
  planifiee: { title: "PLANIFIÉES", color: theme.info },
});

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Progression temporelle (jours écoulés / durée totale) — utilisée
// uniquement pour les activités "en cours", faute de % de complétion réel.
function computeProgress(activite) {
  if (!activite.date_debut || !activite.date_fin) return undefined;
  const start = new Date(activite.date_debut).getTime();
  const end = new Date(activite.date_fin).getTime();
  if (!(end > start)) return undefined;
  const pct = ((Date.now() - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

// --- COMPOSANT : Carte d'Activité (Kanban Card) ---
const ActivityCard = ({ title, date, category, progress, isLate }) => {
  const theme = useLocalTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        bgcolor: theme.card,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {/* Barre latérale rouge pour retard */}
      {isLate && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: theme.warning,
          }}
        />
      )}

      <Stack spacing={0.5} sx={{ pl: isLate ? 1 : 0 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: theme.textMain, fontWeight: 600, lineHeight: 1.3 }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isLate ? theme.warning : theme.textSecondary,
            display: "block",
          }}
        >
          {date} {category && `• ${category}`}
        </Typography>
        {isLate && (
          <Typography
            variant="caption"
            sx={{ color: theme.warning, fontWeight: 700 }}
          >
            Échéance dépassée
          </Typography>
        )}
      </Stack>

      {/* Barre de progression jaune fine (pour "En cours") */}
      {progress !== undefined && (
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flexGrow: 1,
              bgcolor: "divider",
              height: 4,
              borderRadius: 2,
              "& .MuiLinearProgress-bar": {
                bgcolor: theme.accent,
                borderRadius: 2,
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

// --- COMPOSANT : Colonne Kanban ---
const KanbanColumn = ({ title, count, color, children, isEmpty }) => {
  const theme = useLocalTheme();
  return (
    <Grid item xs={12} md={4}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, px: 0.5 }}
      >
        <Typography
          sx={{
            color: color,
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
        <Chip
          label={count}
          size="small"
          sx={{
            bgcolor: theme.paper,
            color: color,
            fontWeight: 700,
            fontSize: "0.7rem",
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      </Stack>
      <Box
        sx={{
          p: 1.5,
          bgcolor: theme.paper,
          borderRadius: 4,
          minHeight: "500px",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {isEmpty ? (
          <Typography
            variant="body2"
            sx={{ color: theme.textSecondary, textAlign: "center", py: 4 }}
          >
            Aucune activité
          </Typography>
        ) : (
          children
        )}
      </Box>
    </Grid>
  );
};

// --- COMPOSANT PRINCIPAL : Page Programme d'activités ---
export default function ProgrammeActivites() {
  const theme = useLocalTheme();
  const CATEGORY_COLUMN = getCategoryColumn(theme);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Instance.get("/api/programmes/activites");
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger le programme d'activités.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivites();
  }, [fetchActivites]);

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error) {
    return <ErrorBlock message={error} onRetry={fetchActivites} />;
  }

  const stats = data?.stats || {
    total: 0,
    realisees: 0,
    en_cours: 0,
    planifiees: 0,
    taux_realisation: 0,
    en_retard: 0,
  };
  const activites = data?.activites || {
    realisees: [],
    en_cours: [],
    planifiees: [],
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bg, minHeight: "100vh" }}>
      {/* --- HEADER --- */}
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
          Programme d'activités
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={data?.saison?.libele || "Saison"}
            sx={{
              bgcolor: theme.card,
              color: theme.success,
              fontWeight: 600,
              px: 1,
              borderRadius: 2,
            }}
          />
          <IconButton sx={{ color: theme.textSecondary }}>
            <NotificationsNoneIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* --- 1. TOP STATS CARDS --- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Activités totales",
            val: String(stats.total),
            color: theme.textMain,
          },
          {
            label: "Taux de réalisation",
            val: `${stats.taux_realisation}%`,
            detail: `${stats.realisees} / ${stats.total} réalisées`,
            color: theme.success,
          },
          {
            label: "En retard",
            val: String(stats.en_retard),
            detail: "Échéance dépassée",
            color: theme.warning,
          },
        ].map((stat, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: theme.paper,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: theme.textSecondary, mb: 1, fontWeight: 500 }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="h3"
                sx={{ color: stat.color, fontWeight: 800, lineHeight: 1 }}
              >
                {stat.val}
              </Typography>
              {stat.detail && (
                <Typography
                  variant="caption"
                  sx={{
                    color: stat.color,
                    mt: 0.5,
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  {stat.detail}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* --- 2. KANBAN COLUMNS --- */}
      <Grid container spacing={3}>
        <KanbanColumn
          title={CATEGORY_COLUMN.realisee.title}
          count={activites.realisees.length}
          color={CATEGORY_COLUMN.realisee.color}
          isEmpty={activites.realisees.length === 0}
        >
          {activites.realisees.map((a) => (
            <ActivityCard
              key={a.id}
              title={a.title}
              date={formatDate(a.date_debut)}
              category={a.category}
            />
          ))}
        </KanbanColumn>

        <KanbanColumn
          title={CATEGORY_COLUMN.en_cours.title}
          count={activites.en_cours.length}
          color={CATEGORY_COLUMN.en_cours.color}
          isEmpty={activites.en_cours.length === 0}
        >
          {activites.en_cours.map((a) => (
            <ActivityCard
              key={a.id}
              title={a.title}
              date={formatDate(a.date_debut)}
              category={a.category}
              progress={computeProgress(a)}
            />
          ))}
        </KanbanColumn>

        <KanbanColumn
          title={CATEGORY_COLUMN.planifiee.title}
          count={activites.planifiees.length}
          color={CATEGORY_COLUMN.planifiee.color}
          isEmpty={activites.planifiees.length === 0}
        >
          {activites.planifiees.map((a) => (
            <ActivityCard
              key={a.id}
              title={a.title}
              date={
                a.is_late
                  ? `En retard • Échéance ${formatDate(a.date_fin)}`
                  : formatDate(a.date_debut)
              }
              category={a.category}
              isLate={a.is_late}
            />
          ))}
        </KanbanColumn>
      </Grid>
    </Box>
  );
}
