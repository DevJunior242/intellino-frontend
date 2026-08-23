import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Skeleton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { Instance } from "../../../Api/Axios";
import PaymentMethodIndex from "../Paiement/Paymentmethodindex";

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("fr-FR");
}

function KpiCard({ icon, label, value, color }) {
  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}
            >
              {label}
            </Typography>
            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 700, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function VueEnsembleTab() {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [aVerifier, setAVerifier] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, aVerifierRes] = await Promise.all([
        Instance.get("/api/subscriptions/statistiques"),
        Instance.get("/api/subscriptions/paiements-a-verifier"),
      ]);
      setStats(statsRes.data?.data || null);
      setAVerifier(aVerifierRes.data?.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement de la comptabilité :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirm = async (paiement) => {
    setProcessingId(paiement.id);
    try {
      await Instance.patch(`/api/subscriptions/paiements/${paiement.id}/confirmer`);
      setAVerifier((prev) => prev.filter((p) => p.id !== paiement.id));
      setToast({ open: true, message: "Paiement confirmé, abonnement activé.", severity: "success" });
      fetchData();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur lors de la confirmation.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paiement) => {
    setProcessingId(paiement.id);
    try {
      await Instance.patch(`/api/subscriptions/paiements/${paiement.id}/rejeter`);
      setAVerifier((prev) => prev.filter((p) => p.id !== paiement.id));
      setToast({ open: true, message: "Déclaration rejetée.", severity: "success" });
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur lors du rejet.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Box>
      {loading ? (
        <Skeleton height={140} sx={{ borderRadius: 3, mb: 3 }} />
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <KpiCard
              icon={<AccountBalanceWalletOutlinedIcon fontSize="large" />}
              label="Encaissé"
              value={`${formatAmount(stats?.total_encaisse)} FCFA`}
              color="#66bb6a"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard
              icon={<HourglassEmptyOutlinedIcon fontSize="large" />}
              label="En attente de vérification"
              value={`${formatAmount(stats?.total_en_attente)} FCFA`}
              color="#ef5350"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard
              icon={<GroupsOutlinedIcon fontSize="large" />}
              label="Abonnés actifs"
              value={stats?.abonnes_actifs ?? 0}
              color="#5C6BC0"
            />
          </Grid>
        </Grid>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "background.paper",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Recettes des abonnements (6 derniers mois)
        </Typography>
        {stats?.par_mois?.length > 0 ? (
          <BarChart
            dataset={stats.par_mois}
            xAxis={[{ scaleType: "band", dataKey: "month" }]}
            series={[{ dataKey: "total", label: "Encaissé", color: theme.palette.primary.main }]}
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

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}>
        Paiements à vérifier
        {aVerifier.length > 0 && (
          <Chip label={aVerifier.length} size="small" sx={{ ml: 1, fontWeight: 700 }} />
        )}
      </Typography>

      {loading ? (
        <Skeleton height={100} sx={{ borderRadius: 3 }} />
      ) : aVerifier.length === 0 ? (
        <Card sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Aucun paiement en attente de vérification pour le moment.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {aVerifier.map((paiement) => (
            <Grid item xs={12} sm={6} key={paiement.id}>
              <Card sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Chip
                        label={paiement.subscription?.plan?.name || "Abonnement"}
                        size="small"
                        sx={{ mb: 1, fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {paiement.subscription?.organisateur?.name || "Organisation"}
                        {" "}
                        <Typography component="span" variant="caption" color="text.secondary">
                          ({paiement.subscription?.organisateur_type})
                        </Typography>
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                        {formatAmount(paiement.amount)} FCFA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Réf: {paiement.transaction_id} — via {paiement.platform_payment_method?.label}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlineIcon />}
                      disabled={processingId === paiement.id}
                      onClick={() => handleConfirm(paiement)}
                    >
                      Confirmer
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<CancelOutlinedIcon />}
                      disabled={processingId === paiement.id}
                      onClick={() => handleReject(paiement)}
                    >
                      Rejeter
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const TABS = [
  { value: "apercu", label: "Vue d'ensemble", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { value: "moyens", label: "Moyens de paiement", icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
];

export default function SuperAdminComptabilite() {
  const [tab, setTab] = useState("apercu");

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
        Comptabilité Intellino
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        Abonnements des clubs, ligues et fédérations à la plateforme.
      </Typography>

      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3, bgcolor: "background.paper" }}
      >
        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 1 }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={t.label}
              icon={t.icon}
              iconPosition="start"
              sx={{ textTransform: "none", minHeight: 56 }}
            />
          ))}
        </Tabs>
      </Paper>

      {tab === "moyens" ? (
        <PaymentMethodIndex
          apiBase="/api/platform-payment-methods"
          subtitle="Ce que les clubs, ligues et fédérations verront pour régler leur abonnement Intellino"
        />
      ) : (
        <VueEnsembleTab />
      )}
    </Box>
  );
}
