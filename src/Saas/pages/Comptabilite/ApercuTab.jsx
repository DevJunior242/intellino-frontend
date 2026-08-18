import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";

function KpiCard({ icon, title, value, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${color}22`,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={800} noWrap>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

const ApercuTab = () => {
  const { activeId } = UseAuth();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const [resStats, resDebts] = await Promise.all([
        Instance.get("/api/payments/statistiques"),
        Instance.get(`/api/payments/finance/debts?club_id=${activeId}`),
      ]);
      setStats(resStats.data?.data || null);
      setTotalUnpaid(resDebts.data?.total_unpaid || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<TrendingUpIcon />}
            title="Total encaissé"
            value={`${parseFloat(stats?.total_paid || 0).toLocaleString()} XOF`}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<CalendarMonthIcon />}
            title="Encaissements ce mois"
            value={stats?.month_payments || 0}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<MoneyOffIcon />}
            title="Total à recouvrer"
            value={`${parseFloat(totalUnpaid || 0).toLocaleString()} XOF`}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<ReceiptLongIcon />}
            title="Transactions au total"
            value={stats?.total_transactions || 0}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Recettes par mois
            </Typography>
            {stats?.monthly_chart?.length > 0 ? (
              <BarChart
                dataset={stats.monthly_chart}
                xAxis={[{ scaleType: "band", dataKey: "month" }]}
                series={[
                  {
                    dataKey: "total",
                    label: "Encaissé",
                    color: theme.palette.primary.main,
                  },
                ]}
                borderRadius={8}
                height={280}
                margin={{ left: 60, right: 10, bottom: 30, top: 10 }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                Aucune recette encaissée pour le moment.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              height: "100%",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Derniers encaissements
            </Typography>
            {stats?.recent?.length > 0 ? (
              <List dense>
                {stats.recent.map((p) => (
                  <ListItem key={p.id} disableGutters sx={{ py: 1 }}>
                    <ListItemText
                      primary={p.student}
                      secondary={p.created_at}
                    />
                    <Chip
                      size="small"
                      label={`${parseFloat(p.amount_paid).toLocaleString()} XOF`}
                      color="success"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Aucun encaissement récent.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApercuTab;
