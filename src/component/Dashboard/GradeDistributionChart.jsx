import React, { useCallback, useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import { Instance } from "../../Api/Axios";

const COLORS = [
  "#1976d2",
  "#9c27b0",
  "#2e7d32",
  "#ed6c02",
  "#d32f2f",
  "#0288d1",
  "#7b1fa2",
  "#c2185b",
];

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
          color: COLORS[index % COLORS.length],
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
