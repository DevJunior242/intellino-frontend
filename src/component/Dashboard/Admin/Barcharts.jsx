import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { UseAuth } from "../../../Api/AuthContext";
export default function Barcharts() {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const { activeClubId } = UseAuth();
  const getAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await Instance(
        `/api/attendances/chart?club_id=${activeClubId}`,
      );
      console.log(response);
      setChartData(response.data.chartData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeClubId]);
  useEffect(() => {
    getAttendance();
  }, [getAttendance]);

  const seriesConfig = [
    { dataKey: "present", stack: "attendance", label: "Présent" },
    { dataKey: "absent", stack: "attendance", label: "Absent" },
  ];
  const config = {
    height: 350,
    margin: { left: 0, right: 20, top: 20, bottom: 30 },
    hideLegend: false,
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
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
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mb: 2,
          fontSize: { xs: 12, sm: 16 },
        }}
      >
        Les statistiques de présence des élèves
      </Typography>

      <Box sx={{ height: 300 }}>
        <BarChart
          dataset={chartData}
          series={seriesConfig}
          xAxis={[{ dataKey: "session" }]}
          {...config}
        />
      </Box>
    </Paper>
  );
}
