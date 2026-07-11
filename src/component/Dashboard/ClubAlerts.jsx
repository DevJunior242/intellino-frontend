import React from "react";
import { motion } from "framer-motion";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

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
          border: `1px solid ${alpha(alert.color, 0.19)}`,
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
            {alert.students?.length > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
              >
                Élèves : {alert.students.join(", ")}
                {alert.count > alert.students.length && "…"}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

function getAlertConfig(theme) {
  return {
    abonnements_expirants: {
      color: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.08),
    },
    evolution_effectif: {
      color: theme.palette.info.main,
      bg: alpha(theme.palette.info.main, 0.08),
    },
    presence_risque: {
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.08),
    },
    examen_grade: {
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.08),
    },
  };
}

const ALERT_TITLES = {
  abonnements_expirants: (alert) =>
    alert.count > 0
      ? `${alert.count} abonnement${alert.count > 1 ? "s" : ""} à renouveler sous 15 jours`
      : "Aucun abonnement à renouveler",
  evolution_effectif: (alert) =>
    `+${alert.nouveaux || 0} nouveau${(alert.nouveaux || 0) > 1 ? "x" : ""} · -${alert.decrocheurs || 0} parti${(alert.decrocheurs || 0) > 1 ? "s" : ""} ce mois`,
  presence_risque: (alert) =>
    alert.count > 0
      ? `${alert.count} élève${alert.count > 1 ? "s" : ""} sans présence (30j) — taux global ${alert.rate ?? 0}%`
      : `Taux de présence global : ${alert.rate ?? 0}%`,
  examen_grade: (alert) =>
    alert.count > 0
      ? `Examen de grade — ${alert.count} candidat${alert.count > 1 ? "s" : ""} inscrit${alert.count > 1 ? "s" : ""}`
      : "Aucun examen de grade programmé",
};

export default function ClubAlerts({ alerts }) {
  const theme = useTheme();

  if (!alerts?.length) return null;

  return (
    <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Alertes & actions requises
        </Typography>
        {alerts.map((alert, index) => {
          const alertConfig = getAlertConfig(theme);
          const fallback = {
            color: theme.palette.text.secondary,
            bg: alpha(theme.palette.text.secondary, 0.08),
          };
          const config = alertConfig[alert.type] || fallback;
          const isNeutral =
            alert.type === "evolution_effectif" ||
            (alert.count === 0 && alert.type !== "presence_risque");

          return (
            <AlertCard
              key={alert.type}
              alert={{
                ...alert,
                color: isNeutral ? config.color : (alert.count > 0 ? config.color : fallback.color),
                bg: isNeutral ? config.bg : (alert.count > 0 ? config.bg : fallback.bg),
                title: ALERT_TITLES[alert.type]?.(alert) ?? alert.type,
              }}
              index={index}
            />
          );
        })}
      </Paper>
    </motion.div>
  );
}
