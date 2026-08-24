import React, { useCallback, useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import { Instance } from "../../Api/Axios";

// Couleurs réelles des ceintures de karaté — le blanc pur serait invisible
// sur un fond clair, remplacé par un gris très clair qui reste lisible.
const BELT_COLORS = {
  blanche: "#E0E0E0",
  jaune: "#FBC02D",
  orange: "#FB8C00",
  verte: "#2E7D32",
  bleue: "#1565C0",
  marron: "#6D4C41",
  noire: "#212121",
};

// Palette de secours pour un grade personnalisé (ex: ceinture à barrette)
// qui ne correspond à aucune couleur de ceinture standard ci-dessus.
const FALLBACK_COLORS = [
  "#1976d2",
  "#9c27b0",
  "#ed6c02",
  "#d32f2f",
  "#0288d1",
  "#7b1fa2",
  "#c2185b",
];

function normalizeGradeName(name) {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .replace(/^(ceinture|centure)\s+/, "")
    .trim();
}

function colorForGrade(name, fallbackIndex) {
  const key = normalizeGradeName(name);
  return BELT_COLORS[key] || FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}

export default function GradeDistributionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await Instance.get("/api/student-stats");
      const distribution = res.data?.data?.distribution || [];
      setData(
        distribution.map((item, index) => ({
          id: item.name,
          label: item.name,
          value: Number(item.value),
          color: colorForGrade(item.name, index),
        })),
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la répartition des grades :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        height: 450,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        backgroundColor: "background.default",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 2, fontSize: { xs: 12, sm: 16 } }}
      >
        Répartition des grades (élèves actuels)
      </Typography>

      <Box
        sx={{
          height: 340,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucun grade décerné pour le moment.
          </Typography>
        ) : (
          <PieChart
            series={[
              {
                data,
                innerRadius: 50,
                paddingAngle: 2,
                cornerRadius: 4,
              },
            ]}
            height={300}
          />
        )}
      </Box>
    </Paper>
  );
}
