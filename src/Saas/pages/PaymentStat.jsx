import { useCallback, useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReceiptIcon from "@mui/icons-material/Receipt";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ConfigSkeleton from "./ConfigSkeleton";

export default function PaymentStat() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeClubId } = UseAuth();

  const fetchStats = useCallback(async () => {
    try {
      const res = await Instance.get(
        `/api/payments/statistiques?club_id=${activeClubId}`,
      );
      console.log(res);
      setStats(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    {
      title: "Total payé",
      value: stats?.total_paid
        ? `${parseFloat(stats.total_paid).toLocaleString()} FCFA`
        : "0 FCFA",
      icon: <PaidIcon fontSize="large" color="primary" />,
    },
    {
      title: "Étudiants payeurs",
      value: stats?.students_count,
      icon: <PeopleIcon fontSize="large" color="error" />,
    },
    {
      title: "Paiements ce mois",
      value: stats?.month_payments,
      icon: <CalendarMonthIcon fontSize="large" color="success" />,
    },
    {
      title: "Transactions",
      value: stats?.total_transactions,
      icon: <ReceiptIcon fontSize="large" color="warning" />,
    },
  ];

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "background.default",
        minHeight: "100vh",
      }}
    >
      {loading && <ConfigSkeleton />}

      {!loading && stats && (
        <>
          <Grid container spacing={3}>
            {/* Cards */}
            {cards.map((card, i) => (
              <Grid item xs={12} md={3} key={i}>
                <Card elevation={3}>
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "background.default",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {card.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {card.value}
                      </Typography>
                    </Box>
                    <IconButton>{card.icon}</IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {/* Charts */}
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 4,
                  overflow: "hidden",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <CardContent
                  sx={{
                    backgroundColor: "background.default",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      color: "text.primary",
                      mb: 3,
                      fontSize: { xs: 16, md: 20 },
                    }}
                  >
                    Paiements par mois
                  </Typography>
                  <Box sx={{ overflowX: "auto" }}>
                    <ResponsiveContainer
                      width={Math.max(stats.monthly_chart.length * 80, 200)}
                      height={300}
                    >
                      <LineChart
                        data={stats.monthly_chart}
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="month"
                          interval={Math.floor(stats.monthly_chart.length / 12)}
                          tick={{ fontSize: 12, fill: "#555" }}
                          axisLine={{ stroke: "#ccc" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#555" }}
                          axisLine={{ stroke: "#e0e0e0" }}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: 8,
                            padding: "10px",
                          }}
                          labelStyle={{ fontWeight: "bold" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#0d47a1"
                          strokeWidth={3}
                          dot={(props) => {
                            const { cx, cy } = props;
                            return (
                              <rect
                                x={cx - 4}
                                y={cy - 4}
                                width={8}
                                height={8}
                                fill="#0d47a1"
                              />
                            );
                          }}
                          activeDot={{ r: 7, fill: "#0d47a1" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Table */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent
                  sx={{
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Derniers paiements
                  </Typography>
                  <TableContainer
                    component={Paper}
                    elevation={1}
                    sx={{ backgroundColor: "background.default" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Montant</TableCell>
                          <TableCell>Méthode de paiement</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {stats.recent?.length > 0 ? (
                          stats.recent.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{p.student}</TableCell>
                              <TableCell>
                                {parseFloat(p.amount_paid).toLocaleString()}{" "}
                                FCFA
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: "bold", color: "green" }}
                              >
                                {p.payment_method}
                              </TableCell>
                              <TableCell>{p.created_at}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>Aucun paiement</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      {!loading && !stats && (
        <Typography align="center">
          Impossible de charger les statistiques
        </Typography>
      )}
    </Box>
  );
}
