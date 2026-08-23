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
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Instance } from "../../../Api/Axios";
import PaymentMethodIndex from "../Paiement/Paymentmethodindex";

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("fr-FR");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const SUBSCRIPTION_STATUS_META = {
  pending_payment: { label: "En attente de paiement", color: "warning" },
  paid: { label: "Actif", color: "success" },
  expired: { label: "Expiré", color: "default" },
  cancelled: { label: "Remplacé", color: "default" },
};

const ORG_TYPE_LABELS = { Club: "Club", Ligue: "Ligue", Federation: "Fédération" };

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

function joursRestants(subscription) {
  if (subscription.status !== "paid" || !subscription.end_date) return null;
  const diffMs = new Date(subscription.end_date) - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function AbonnementsTab() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Instance.get("/api/subscriptions")
      .then(({ data }) => setSubscriptions(data?.subscriptions?.data || []))
      .catch(() => {
        // Silencieux : la page reste affichable (liste vide) plutôt que de planter.
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = subscriptions.map((s) => ({ ...s, id: s.id }));

  const columns = [
    {
      field: "organisateur",
      headerName: "Organisation",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => row.organisateur?.name || "—",
    },
    {
      field: "organisateur_type",
      headerName: "Type",
      width: 110,
      renderCell: (params) => (
        <Chip size="small" label={ORG_TYPE_LABELS[params.value] || params.value} variant="outlined" />
      ),
    },
    {
      field: "plan",
      headerName: "Palier",
      flex: 1,
      minWidth: 140,
      valueGetter: (value, row) => row.plan?.name || "—",
    },
    {
      field: "amount",
      headerName: "Montant",
      width: 130,
      valueFormatter: (value) => `${formatAmount(value)} FCFA`,
    },
    {
      field: "status",
      headerName: "Statut",
      width: 190,
      renderCell: (params) => {
        const meta = SUBSCRIPTION_STATUS_META[params.value] || { label: params.value, color: "default" };
        return <Chip size="small" label={meta.label} color={meta.color} />;
      },
    },
    {
      field: "start_date",
      headerName: "Début",
      width: 120,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: "end_date",
      headerName: "Fin",
      width: 120,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: "jours_restants",
      headerName: "Délai restant",
      width: 130,
      sortable: false,
      renderCell: (params) => {
        const jours = joursRestants(params.row);
        if (jours === null) return "—";
        if (jours < 0) return <Chip size="small" label="Expiré" color="error" />;
        return `${jours} jour${jours > 1 ? "s" : ""}`;
      },
    },
  ];

  return (
    <Box sx={{ height: "70vh", width: "100%", minWidth: 0 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
        localeText={{
          noRowsLabel: "Aucun abonnement pour le moment.",
        }}
      />
    </Box>
  );
}

const TABS = [
  { value: "apercu", label: "Vue d'ensemble", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { value: "abonnements", label: "Abonnements", icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
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
      ) : tab === "abonnements" ? (
        <AbonnementsTab />
      ) : (
        <VueEnsembleTab />
      )}
    </Box>
  );
}
