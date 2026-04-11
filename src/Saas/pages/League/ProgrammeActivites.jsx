import React from "react";
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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

// --- COULEURS DU THÈME EXACT (Dark Mode de l'image) ---
const theme = {
  bg: "#1a1d21", // Fond principal
  paper: "#212529", // Fond des cartes stats et colonnes
  card: "#2c3035", // Fond des cartes d'activité (Kanban)
  textMain: "#ffffff",
  textSecondary: "#8b90a0",
  accent: "#e8c84a", // Jaune Karaté
  success: "#4caf50", // Vert
  info: "#2196f3", // Bleu
  warning: "#f44336", // Rouge
};

// --- COMPOSANT : Carte d'Activité (Kanban Card) ---
const ActivityCard = ({ title, date, category, progress, isLate }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1.5,
      bgcolor: theme.card,
      borderRadius: 2,
      border: "1px solid rgba(255,255,255,0.03)",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative",
      overflow: "hidden",
      "&:hover": { bgcolor: "#32363b" },
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
            bgcolor: "#1a1d21",
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

// --- COMPOSANT : Colonne Kanban ---
const KanbanColumn = ({ title, count, color, children }) => (
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
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      />
    </Stack>
    <Box
      sx={{
        p: 1.5,
        bgcolor: theme.paper,
        borderRadius: 4,
        minHeight: "500px",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </Box>
  </Grid>
);

// --- COMPOSANT PRINCIPAL : Page Programme d'activités ---
export default function ProgrammeActivites() {
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
            label="Saison 2024–2025"
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
          <Avatar
            sx={{
              bgcolor: theme.accent,
              color: "#1a1d21",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            AD
          </Avatar>
        </Stack>
      </Stack>

      {/* --- 1. TOP STATS CARDS --- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: "Activités totales", val: "34", color: theme.textMain },
          {
            label: "Taux de réalisation",
            val: "71%",
            detail: "24 / 34 réalisées",
            color: theme.success,
          },
          {
            label: "En retard",
            val: "4",
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
                border: "1px solid rgba(255,255,255,0.05)",
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
        {/* COLONNE RÉALISÉES */}
        <KanbanColumn title="RÉALISÉES" count="24" color={theme.success}>
          <ActivityCard
            title="Assemblée générale ordinaire"
            date="15 janv. 2025"
            category="Bureau"
          />
          <ActivityCard
            title="Stage national Kata"
            date="3 fév. 2025"
            category="Technique"
          />
          <ActivityCard
            title="Formation arbitres régionaux"
            date="22 fév. 2025"
            category="Arbitrage"
          />
          <ActivityCard
            title="Coupe de la Ligue"
            date="1 fév. 2025"
            category="Compétition"
          />
        </KanbanColumn>

        {/* COLONNE EN COURS */}
        <KanbanColumn title="EN COURS" count="6" color={theme.accent}>
          <ActivityCard
            title="Championnat national"
            date="12 avr. 2025"
            category="Compétitions"
            progress={40}
          />
          <ActivityCard
            title="Mise à jour registre grades"
            date="Responsable technique"
          />
          <ActivityCard
            title="Examen de grades — mars"
            date="21 mars 2025"
            category="Grades"
            progress={65}
          />
        </KanbanColumn>

        {/* COLONNE PLANIFIÉES */}
        <KanbanColumn title="PLANIFIÉES" count="4" color={theme.info}>
          <ActivityCard
            title="Stage international Kumite"
            date="Juin 2025"
            category="Formation"
          />
          <ActivityCard
            title="Rapport bilan saison"
            date="En retard • Échéance mars"
            category=""
            isLate={true}
          />
          <ActivityCard
            title="Séminaire entraîneurs"
            date="Sept. 2025"
            category="Formation"
          />
        </KanbanColumn>
      </Grid>
    </Box>
  );
}
