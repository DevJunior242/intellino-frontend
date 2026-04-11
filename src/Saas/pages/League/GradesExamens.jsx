import React from "react";
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
          label="Saison 2024–2025"
          sx={{ bgcolor: theme.card, color: theme.success, fontWeight: 600 }}
        />
      </Stack>

      {/* STATS DU HAUT */}
      <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
        <StatCard
          title="Grades décernés cette saison"
          value="312"
          detail="+18% vs préc."
          detailColor={theme.success}
        />
        <StatCard
          title="Sessions d'examen"
          value="8"
          detail="dont 1 à venir"
          detailColor={theme.success}
        />
        <StatCard
          title="Taux de réussite"
          value="87%"
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
              Prochaine session d'examen — 21 mars 2025
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Chip
                label="Salle omnisports Abidjan"
                size="small"
                sx={{ bgcolor: "#e3f2fd", color: "#0d47a1" }}
              />
              <Chip
                label="32 candidats"
                size="small"
                sx={{ bgcolor: theme.card, color: theme.textSecondary }}
              />
              <Chip
                label="Jury à confirmer"
                size="small"
                sx={{ bgcolor: "#fff3e0", color: "#e65100" }}
              />
            </Stack>

            {/* TABLEAU SIMPLIFIÉ */}
            <Box sx={{ mt: 4 }}>
              <Grid
                container
                sx={{
                  color: theme.textSecondary,
                  pb: 1,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                <Grid item xs={4}>
                  Niveau
                </Grid>
                <Grid item xs={4}>
                  Candidats
                </Grid>
                <Grid item xs={4}>
                  Prérequis
                </Grid>
              </Grid>

              {[
                {
                  label: "4e Kyu → 3e Kyu",
                  count: 8,
                  status: "OK",
                  statusType: "success",
                },
                {
                  label: "2e Kyu → 1er Kyu",
                  count: 11,
                  status: "OK",
                  statusType: "success",
                },
                {
                  label: "1er Kyu → 1er Dan",
                  count: 9,
                  status: "2 manquants",
                  statusType: "warning",
                },
                {
                  label: "1er Dan → 2e Dan",
                  count: 4,
                  status: "OK",
                  statusType: "success",
                },
              ].map((row, i) => (
                <Grid
                  container
                  key={i}
                  sx={{
                    py: 2,
                    borderBottom: "1px solid rgba(255,255,255,0.02)",
                    alignItems: "center",
                  }}
                >
                  <Grid
                    item
                    xs={4}
                    sx={{ color: theme.textMain, fontSize: "0.9rem" }}
                  >
                    {row.label}
                  </Grid>
                  <Grid item xs={4} sx={{ color: theme.textMain }}>
                    {row.count}
                  </Grid>
                  <Grid item xs={4}>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        bgcolor:
                          row.statusType === "success"
                            ? "rgba(76, 175, 80, 0.1)"
                            : "rgba(230, 81, 0, 0.1)",
                        color:
                          row.statusType === "success"
                            ? theme.success
                            : "#e65100",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.2)",
                  textTransform: "none",
                }}
              >
                Fiches de notation
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.2)",
                  textTransform: "none",
                }}
              >
                Confirmer jury
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* SECTION : RÉPARTITION */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: theme.paper,
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.05)",
              height: "100%",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: theme.textMain, fontWeight: 600, mb: 4 }}
            >
              Répartition des grades
            </Typography>

            <GradeProgress
              label="Kyu (1-9)"
              value={68}
              progressColor={theme.info}
            />
            <GradeProgress
              label="1er Dan"
              value={18}
              progressColor={theme.card}
            />
            <GradeProgress
              label="2e Dan"
              value={8}
              progressColor={theme.card}
            />
            <GradeProgress
              label="3e Dan et +"
              value={6}
              progressColor={theme.card}
            />

            <Typography
              variant="h4"
              sx={{
                color: "rgba(255,255,255,0.1)",
                mt: 2,
                textAlign: "center",
              }}
            >
              +
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
