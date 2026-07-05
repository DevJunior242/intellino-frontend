import React, { useCallback, useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import { Instance } from "../../../Api/Axios";

export default function ClubsParLigueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await Instance.get("/api/federation/clubs-par-ligue");
      setData(res.data?.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des clubs par ligue :", error);
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
        bgcolor: "#22262f",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ color: "#e8eaf0", fontWeight: 700, mb: 2 }}
        >
          Clubs affiliés par ligue
        </Typography>

        <Box sx={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {loading ? (
            <CircularProgress sx={{ color: "#e8c84a" }} />
          ) : data.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#8b90a0" }}>
              Aucune ligue affiliée pour le moment.
            </Typography>
          ) : (
            <BarChart
              dataset={data}
              xAxis={[{ scaleType: "band", dataKey: "league_name" }]}
              yAxis={[{ min: 0 }]}
              series={[{ dataKey: "total_clubs", label: "Clubs", color: "#4a90e2" }]}
              borderRadius={8}
              margin={{ left: 40, right: 10, bottom: 50, top: 10 }}
              height={260}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
