import React, { useEffect, useState } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { Box, Typography, Paper, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";

export default function VitalityGauge() {
  const [vitalityData, setVitalityData] = useState({
    vitality_score: 10,
    nouveaux_dan: 20,
    taux_reussite: 50,
  });
  const { activeId, activeType } = UseAuth();

  const getVitalityStats = async () => {
    try {
      const response = await Instance.get(
        `/api/examens/vitality-stats?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      setVitalityData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération de la vitalité", error);
    }
  };
  useEffect(() => {
    if (activeId && activeType) {
      getVitalityStats();
    }
  }, [activeId, activeType]);

  const data = vitalityData;
  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: "1px solid #eee", borderRadius: 4 }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <TrendingUpIcon sx={{ color: "#d32f2f" }} />
        <Typography variant="h6" fontWeight="bold">
          Vitalité de la Ligue
        </Typography>
      </Stack>

      <Box sx={{ height: 180, display: "flex", justifyContent: "center" }}>
        <Gauge
          value={data.vitality_score}
          startAngle={-110}
          endAngle={110}
          innerRadius="80%"
          outerRadius="100%"
          sx={{
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 32,
              fontWeight: 800,
              fill: "#1a1a1a",
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: data.vitality_score > 60 ? "#2e7d32" : "#ed6c02",
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: "#f5f5f5",
            },
          }}
          text={({ value }) => `${value}%`}
        />
      </Box>

      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Objectif de la saison
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="primary">
          {data.nouveaux_dan}{" "}
          <small style={{ fontSize: "14px" }}>nouveaux 1er Dan</small>
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1, color: "green" }}
        >
          Taux de réussite : {data.taux_reussite}%
        </Typography>
      </Box>
    </Paper>
  );
}
