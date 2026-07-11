import React, { useCallback, useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Instance } from "../../../Api/Axios";

export default function LicenceRevenueChart() {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await Instance.get(
        "/api/licence-payments/statistiques-mensuelles",
      );
      setData(res.data?.data || []);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des recettes licences :",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ color: "text.primary", fontWeight: 700, mb: 2 }}
        >
          Recettes licences encaissées (6 derniers mois)
        </Typography>

        <Box
          sx={{
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <CircularProgress sx={{ color: theme.palette.warning.main }} />
          ) : data.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                  label: "Recettes licences",
                  color: theme.palette.warning.main,
                },
              ]}
              borderRadius={8}
              margin={{ left: 60, right: 10, bottom: 30, top: 10 }}
              height={260}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
