import React, { useCallback, useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Instance } from "../../Api/Axios";

// Remplace Fede/LicenceRevenueChart.jsx et League/StageRevenueChart.jsx —
// mêmes recettes maintenant unifiées dans /api/transactions, un seul
// composant paramétrable au lieu de deux quasi-identiques.
export default function TransactionRevenueChart({
  title = "Recettes encaissées (6 derniers mois)",
  payableType = null,
  seriesLabel = "Recettes",
  color,
  height = 420,
}) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Instance.get("/api/transactions/statistiques-mensuelles", {
        params: payableType ? { payable_type: payableType } : undefined,
      });
      setData(res.data?.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes :", error);
    } finally {
      setLoading(false);
    }
  }, [payableType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        height,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "text.primary",
          fontWeight: 700,
          mb: 2,
          fontSize: { xs: 12, sm: 16 },
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          height: height - 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucune recette encaissée sur les 6 derniers mois.
          </Typography>
        ) : (
          <BarChart
            dataset={data}
            xAxis={[{ scaleType: "band", dataKey: "month" }]}
            yAxis={[
              {
                valueFormatter: (value) => {
                  if (value == null) return "";
                  const val = Number(value);
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${val / 1000}k`;
                  return val.toString();
                },
                min: 0,
              },
            ]}
            series={[
              {
                dataKey: "total",
                label: seriesLabel,
                color: color || theme.palette.primary.main,
              },
            ]}
            borderRadius={8}
            margin={{ left: 60, right: 10, bottom: 30, top: 10 }}
            height={height - 120}
          />
        )}
      </Box>
    </Paper>
  );
}
