import { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { EmojiEvents, MilitaryTech } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0a0f1a",
  card: "#111827",
  border: "#1e2a3a",
  text: "#e2e8f0",
  muted: "#64748b",
  or: "#f59e0b",
  argent: "#94a3b8",
  bronze: "#d97706",
};

function initiales(nom) {
  if (!nom) return "?";
  return nom
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  ["#ef444420", "#ef4444"],
  ["#3b82f620", "#3b82f6"],
  ["#00e5c020", "#00e5c0"],
  ["#f59e0b20", "#f59e0b"],
  ["#8b5cf620", "#8b5cf6"],
  ["#ec489920", "#ec4899"],
];

function RangBadge({ rang }) {
  if (rang === 1)
    return (
      <Chip
        icon={
          <EmojiEvents
            sx={{ fontSize: "14px !important", color: `${C.or} !important` }}
          />
        }
        label="1er"
        size="small"
        sx={{
          bgcolor: `${C.or}20`,
          color: C.or,
          border: `1px solid ${C.or}40`,
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      />
    );
  if (rang === 2)
    return (
      <Chip
        icon={
          <MilitaryTech
            sx={{
              fontSize: "14px !important",
              color: `${C.argent} !important`,
            }}
          />
        }
        label="2e"
        size="small"
        sx={{
          bgcolor: `${C.argent}20`,
          color: C.argent,
          border: `1px solid ${C.argent}40`,
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      />
    );
  if (rang === 3)
    return (
      <Chip
        icon={
          <MilitaryTech
            sx={{
              fontSize: "14px !important",
              color: `${C.bronze} !important`,
            }}
          />
        }
        label="3e"
        size="small"
        sx={{
          bgcolor: `${C.bronze}20`,
          color: C.bronze,
          border: `1px solid ${C.bronze}40`,
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      />
    );
  if (rang === 4)
    return (
      <Chip
        label="4e"
        size="small"
        sx={{ bgcolor: `${C.bronze}15`, color: C.bronze, fontSize: "0.7rem" }}
      />
    );
  return (
    <Chip
      label={`${rang}e`}
      size="small"
      sx={{ bgcolor: "#1e2a3a", color: C.muted, fontSize: "0.7rem" }}
    />
  );
}

function MarchesPodium({ or, argent, bronze1 }) {
  const marches = [
    {
      data: argent,
      rang: 2,
      label: "Argent",
      height: 110,
      color: C.argent,
      bgColor: "#94a3b830",
      width: 130,
    },
    {
      data: or,
      rang: 1,
      label: "Or",
      height: 160,
      color: C.or,
      bgColor: "#f59e0b30",
      width: 150,
    },
    {
      data: bronze1,
      rang: 3,
      label: "Bronze",
      height: 80,
      color: C.bronze,
      bgColor: "#d9770630",
      width: 130,
    },
  ];

  return (
    <Stack
      direction="row"
      alignItems="flex-end"
      justifyContent="center"
      gap={1.5}
      sx={{ height: 280, mb: 4 }}
    >
      {marches.map((m, i) => (
        <motion.div
          key={m.rang}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
        >
          <Stack alignItems="center" sx={{ width: m.width }}>
            {/* Info athlète */}
            <Box sx={{ textAlign: "center", mb: 1, px: 1 }}>
              {m.rang === 1 && (
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <EmojiEvents sx={{ color: C.or, fontSize: 32, mb: 0.5 }} />
                </motion.div>
              )}
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: m.color,
                  lineHeight: 1.2,
                }}
                noWrap
              >
                {m.data?.athlete_nom ?? "—"}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: C.muted }} noWrap>
                {m.data?.club_nom ?? "—"}
              </Typography>
            </Box>

            {/* Marche */}
            <Box
              sx={{
                width: "100%",
                height: m.height,
                bgcolor: m.bgColor,
                border: `1px solid ${m.color}40`,
                borderBottom: "none",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: m.color,
                  lineHeight: 1,
                }}
              >
                {m.rang}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: m.color,
                  letterSpacing: 1.5,
                  opacity: 0.8,
                }}
              >
                {m.label.toUpperCase()}
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      ))}
    </Stack>
  );
}

export default function PodiumViewer({ configId }) {
  const [podium, setPodium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!configId) return;
    setLoading(true);
    try {
      const res = await Instance.get(`/api/podium/${configId}`);
      setPodium(res.data || null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le podium.");
    } finally {
      setLoading(false);
    }
  }, [configId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress sx={{ color: C.or }} />
        <Typography sx={{ color: C.muted, mt: 2, fontSize: "0.85rem" }}>
          Calcul du classement...
        </Typography>
      </Stack>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );

  if (!podium?.or)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <EmojiEvents sx={{ fontSize: 48, color: C.muted, mb: 2 }} />
        <Typography sx={{ color: C.muted }}>
          Aucun résultat disponible
        </Typography>
      </Stack>
    );

  return (
    <Box sx={{ bgcolor: C.bg, minHeight: "100%", p: 2 }}>
      <AnimatePresence>
        {/* Podium visuel */}
        <MarchesPodium
          or={podium.or}
          argent={podium.argent}
          bronze1={podium.bronze_1}
        />

        {/* Tableau classement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Paper
            sx={{
              bgcolor: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${C.border}` }}
            >
              <Typography
                sx={{ color: C.text, fontWeight: 700, fontSize: "0.9rem" }}
              >
                Classement général officiel
              </Typography>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "Rang",
                      "Athlète",
                      "Poule",
                      "Pts victoire",
                      "Marqués",
                      "Encaissés",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          color: C.muted,
                          fontSize: "0.65rem",
                          letterSpacing: 1,
                          bgcolor: "#0f1623",
                          borderBottom: `1px solid ${C.border}`,
                          py: 1.5,
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {podium.complet?.map((row, i) => {
                    const [bg, fg] = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    return (
                      <motion.tr
                        key={row.inscription_id || i}
                        component={TableRow}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        sx={{
                          "&:hover td": { bgcolor: "#1e2a3a" },
                          "&:last-child td": { borderBottom: "none" },
                        }}
                      >
                        <TableCell
                          sx={{
                            borderBottom: `1px solid ${C.border}`,
                            py: 1.2,
                          }}
                        >
                          <RangBadge rang={i + 1} />
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom: `1px solid ${C.border}`,
                            py: 1.2,
                          }}
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: bg,
                                color: fg,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                              }}
                            >
                              {initiales(row.athlete_nom)}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  color: C.text,
                                  lineHeight: 1.2,
                                }}
                              >
                                {row.athlete_nom ?? "—"}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "0.65rem", color: C.muted }}
                              >
                                {row.club_nom ?? "—"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom: `1px solid ${C.border}`,
                            py: 1.2,
                          }}
                        >
                          <Chip
                            label={row.nom_poule}
                            size="small"
                            sx={{
                              bgcolor: "#1e2a3a",
                              color: C.muted,
                              fontSize: "0.65rem",
                              height: 20,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            borderBottom: `1px solid ${C.border}`,
                            py: 1.2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: C.or,
                            }}
                          >
                            {row.points_victoire}
                          </Typography>
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            borderBottom: `1px solid ${C.border}`,
                            py: 1.2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              color: "#22c55e",
                              fontWeight: 600,
                            }}
                          >
                            +{row.total_points_marques}
                          </Typography>
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            borderBottom: `1px solid ${C.border}`,
                            py: 1.2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              color: "#ef4444",
                              fontWeight: 600,
                            }}
                          >
                            -{row.total_points_encaisses}
                          </Typography>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
