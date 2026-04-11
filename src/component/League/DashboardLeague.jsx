import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Table,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";

// ─── Icons (inline SVG via MUI SvgIcon approach, using emoji fallback) ───────
const icons = {
  dashboard: "⊞",
  clubs: "🏠",
  licences: "🪪",
  categories: "⊞",
  bureau: "👤",
  competitions: "★",
  grades: "▲",
  notation: "▣",
  athletes: "👥",
  paiements: "▣",
  bell: "🔔",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  {
    label: "Licenciés actifs",
    value: "4 328",
    sub: "+12% vs saison préc.",
    subColor: "#4caf50",
  },
  {
    label: "Clubs affiliés",
    value: "87",
    sub: "+3 nouveaux",
    subColor: "#4caf50",
  },
  {
    label: "Compétitions cette saison",
    value: "24",
    sub: "8 à venir",
    subColor: "#8b90a0",
  },
  {
    label: "Recettes (FCFA)",
    value: "18,4M",
    sub: "-4% objectif",
    subColor: "#f44336",
  },
];

const alerts = [
  {
    color: "#f44336",
    bg: "rgba(244,67,54,0.08)",
    title: "14 licences expirées",
    desc: "Clubs : Dragon Noir, Bushido Abidjan, Tigre FC…",
  },
  {
    color: "#ff9800",
    bg: "rgba(255,152,0,0.08)",
    title: "7 cotisations clubs impayées",
    desc: "Échéance dépassée depuis >30 jours",
  },
  {
    color: "#4caf50",
    bg: "rgba(76,175,80,0.08)",
    title: "Examen de grades prévu dans 5 jours",
    desc: "32 candidats inscrits — jury à confirmer",
  },
  {
    color: "#2196f3",
    bg: "rgba(33,150,243,0.08)",
    title: "Championnat national — inscriptions ouvertes",
    desc: "Fermeture le 28 mars · 43 inscrits",
  },
];

const categories = ["Poussin", "Benjam.", "Minime", "Cadet", "Senior"];
const catValues = [18, 28, 22, 16, 16];

const activities = [
  {
    date: "16 mars 2025",
    action: "Licence émise…",
    user: "Club Tigre FC",
    status: "Validée",
    color: "#4caf50",
  },
  {
    date: "15 mars 2025",
    action: "Inscription co…",
    user: "Dragon Noir",
    status: "En attente",
    color: "#ff9800",
  },
  {
    date: "14 mars 2025",
    action: "Paiement coti…",
    user: "Bushido Abidj…",
    status: "Reçu",
    color: "#2196f3",
  },
  {
    date: "13 mars 2025",
    action: "Grade 1er Da…",
    user: "Ligue (examen)",
    status: "Admise",
    color: "#4caf50",
  },
  {
    date: "12 mars 2025",
    action: "Nouveau club…",
    user: "Secrétariat",
    status: "En cours",
    color: "#9c27b0",
  },
];
// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      style={{ flex: 1 }}
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.75rem", mb: 1 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "#e8eaf0",
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: subColor, fontWeight: 500 }}>
          {sub}
        </Typography>
      </Paper>
    </motion.div>
  );
}
function MiniBar({ label, value, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#e8c84a", fontWeight: 600 }}
          >
            {value}%
          </Typography>
        </Box>
        <Box
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 3,
              background: "linear-gradient(90deg, #e8c84a, #f0a030)",
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
}

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
            <Typography variant="caption" sx={{ color: "#8b90a0" }}>
              {alert.desc}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

function DashboardLeague() {
  return (
    <Box>
      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </Box>
      {/* Middle Row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {/* Alerts */}
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
            {alerts.map((a, i) => (
              <AlertCard key={i} alert={a} index={i} />
            ))}
          </Paper>
        </motion.div>

        {/* Categories */}
        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
          style={{ flex: 1 }}
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
              Licenciés par catégorie
            </Typography>
            {categories.map((cat, i) => (
              <MiniBar key={cat} label={cat} value={catValues[i]} index={i} />
            ))}
          </Paper>
        </motion.div>
      </Box>
      {/* Activity Table */}
      <motion.div
        variants={fadeUp}
        custom={2}
        initial="hidden"
        animate="visible"
      >
        <Paper
          sx={{
            bgcolor: "#22262f",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.05)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Dernières activités
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      color: "#555a6b",
                      fontSize: "0.73rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      py: 1,
                    },
                  }}
                >
                  <TableCell>Date</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {activities.map((row, i) => (
                    <motion.tr
                      key={row.date + row.action}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.3 + i * 0.06,
                        duration: 0.35,
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell
                        sx={{
                          color: "#8b90a0",
                          fontSize: "0.78rem",
                          py: 1.5,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {row.date}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#c0c4d0",
                          fontSize: "0.78rem",
                          py: 1.5,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {row.action}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#c0c4d0",
                          fontSize: "0.78rem",
                          py: 1.5,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {row.user}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.5,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            bgcolor: `${row.color}18`,
                            color: row.color,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            border: `1px solid ${row.color}40`,
                            height: 22,
                          }}
                        />
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default DashboardLeague;
