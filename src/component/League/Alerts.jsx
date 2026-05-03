import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Paper, Typography } from "@mui/material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ErrorBlock from "../../Saas/pages/ErrorBlock";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function AlertCard({ alert, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alert.bg,
          border: `1px solid ${alert.color}30`,
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: alert.color,
              mt: 0.6,
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: alert.color, mb: 0.3 }}
            >
              {alert.title}
            </Typography>
            {alert.clubs?.length > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "#8b90a0", display: "block", mt: 0.5 }}
              >
                Clubs : {alert.clubs.join(", ")}
                {alert.count > alert.clubs.length && "…"}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// Mapping des couleurs par type d'alerte
const ALERT_CONFIG = {
  licences_expirees: {
    color: "#f44336",
    bg: "rgba(244,67,54,0.08)",
  },
  cotisations_impayees: {
    color: "#ff9800",
    bg: "rgba(255,152,0,0.08)",
  },
  examens: {
    color: "#4caf50",
    bg: "rgba(76,175,80,0.08)",
  },
  competition: {
    color: "#2196f3",
    bg: "rgba(33,150,243,0.08)",
  },
};

// Titre lisible par type
const ALERT_TITLES = {
  licences_expirees: (count) =>
    `${count} licence${count > 1 ? "s" : ""} expirée${count > 1 ? "s" : ""}`,
  cotisations_impayees: (count) =>
    `${count} cotisation${count > 1 ? "s" : ""} club${count > 1 ? "s" : ""} impayée${count > 1 ? "s" : ""}`,
  examens: (count) =>
    `Examen de grades — ${count} candidat${count > 1 ? "s" : ""} inscrit${count > 1 ? "s" : ""}`,
  competition: (_) => "Championnat national — inscriptions ouvertes",
};
export default function Alerts() {
  const { activeId } = UseAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const fetchAlerts = async () => {
    if (!activeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await Instance.get(
        `/api/dashboard/league/alert?organisateur_id=${activeId}`,
      );
      console.log(response);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes :", error);
      setError("Erreur lors de la récupération des alertes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);
  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error) return <ErrorBlock message={error} onRetry={fetchAlerts} />;

  return (
    <motion.div
      variants={fadeUp}
      custom={0}
      initial="hidden"
      animate="visible"
      style={{ flex: 1.5 }}
    >
      <Paper
        sx={{
          p: 2.5,
          bgcolor: "#22262f",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.05)",
          height: "100%",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Alertes & actions requises
        </Typography>
        {alerts.map((alert, index) => {
          const config = ALERT_CONFIG[alert.type] || {
            color: "#8b90a0",
            bg: "rgba(139,144,160,0.08)",
          };

          return (
            <AlertCard
              key={alert.type}
              alert={{
                ...alert,
                color: alert.count > 0 ? config.color : "#8b90a0",
                bg: alert.count > 0 ? config.bg : "rgba(139,144,160,0.08)",
                title: ALERT_TITLES[alert.type]?.(alert.count) ?? alert.type,
              }}
              index={index}
            />
          );
        })}
      </Paper>
    </motion.div>
  );
}
