import React, { useCallback, useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import { parse } from "date-fns";

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { activeClubId } = UseAuth();

  const fetchData = useCallback(async () => {
    try {
      const res = await Instance.get(
        `/api/payments/stats?club_id=${activeClubId}`,
      );
      console.log(res);
      //fomatted amount
      const formattedData = res.data.map((item) => ({
        ...item,
        total: parseFloat(item.total),
      }));
      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <CircularProgress />;

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
        Revenus des 6 derniers mois ( xof)
      </Typography>

      <Box sx={{ width: "100%", height: 300 }}>
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
              tickNumber: 10,
            },
          ]}
          series={[{ dataKey: "total", label: "Recettes", color: "#1976d2" }]}
          borderRadius={8}
          margin={{ left: 60, right: 10, bottom: 30, top: 10 }}
        />
      </Box>
    </Paper>
  );
};

export default RevenueChart;
