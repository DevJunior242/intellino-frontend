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
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { Instance } from "../../Api/Axios";
import TransactionRevenueChart from "./TransactionRevenueChart";

const TYPE_LABELS = {
  licence_lot: "Licences",
  affiliation: "Affiliations",
  stage: "Stages",
  examen: "Examens",
};

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
              {formatAmount(value)} <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>FCFA</Typography>
            </Typography>
          </Box>
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Comptabilite() {
  const [stats, setStats] = useState(null);
  const [byType, setByType] = useState({});
  const [aVerifier, setAVerifier] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [globalRes, ...typeResults] = await Promise.all([
        Instance.get("/api/transactions/statistiques"),
        ...Object.keys(TYPE_LABELS).map((type) =>
          Instance.get("/api/transactions/statistiques", { params: { payable_type: type } }),
        ),
      ]);
      setStats(globalRes.data?.data || null);

      const breakdown = {};
      Object.keys(TYPE_LABELS).forEach((type, index) => {
        breakdown[type] = typeResults[index].data?.data || null;
      });
      setByType(breakdown);

      const aVerifierRes = await Instance.get("/api/transactions/a-verifier");
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

  const handleConfirm = async (transaction) => {
    setProcessingId(transaction.id);
    try {
      await Instance.patch(`/api/transactions/${transaction.id}/confirmer`);
      setAVerifier((prev) => prev.filter((t) => t.id !== transaction.id));
      setToast({ open: true, message: "Paiement confirmé.", severity: "success" });
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

  const handleReject = async (transaction) => {
    setProcessingId(transaction.id);
    try {
      await Instance.patch(`/api/transactions/${transaction.id}/rejeter`);
      setAVerifier((prev) => prev.filter((t) => t.id !== transaction.id));
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
      <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
        Comptabilité
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        Vue consolidée de tous les paiements — licences, affiliations, stages, examens.
      </Typography>

      {loading ? (
        <Skeleton height={140} sx={{ borderRadius: 3, mb: 3 }} />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <KpiCard
                icon={<AccountBalanceWalletOutlinedIcon fontSize="large" />}
                label="Total attendu"
                value={stats?.total_attendu}
                color="#5C6BC0"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard
                icon={<PaidOutlinedIcon fontSize="large" />}
                label="Encaissé"
                value={stats?.total_encaisse}
                color="#66bb6a"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard
                icon={<HourglassEmptyOutlinedIcon fontSize="large" />}
                label="En attente"
                value={stats?.total_en_attente}
                color="#ef5350"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}>
            Répartition par type
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <Grid item xs={6} sm={3} key={type}>
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {label}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {formatAmount(byType[type]?.total_encaisse)} FCFA
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.disabled" }}>
                      {formatAmount(byType[type]?.total_en_attente)} FCFA en attente
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Box sx={{ mb: 4 }}>
        <TransactionRevenueChart title="Recettes globales encaissées (6 derniers mois)" />
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}>
        Paiements à vérifier
        {aVerifier.length > 0 && (
          <Chip label={aVerifier.length} size="small" sx={{ ml: 1, fontWeight: 700 }} />
        )}
      </Typography>

      {loading ? (
        <Skeleton height={100} sx={{ borderRadius: 3 }} />
      ) : aVerifier.length === 0 ? (
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Aucun paiement en attente de vérification pour le moment.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {aVerifier.map((transaction) => (
            <Grid item xs={12} sm={6} key={transaction.id}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Chip
                        label={TYPE_LABELS[transaction.payable_type] || transaction.payable_type}
                        size="small"
                        sx={{ mb: 1, fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {transaction.club?.name || "Club"}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                        {formatAmount(transaction.amount)} FCFA
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlineIcon />}
                      disabled={processingId === transaction.id}
                      onClick={() => handleConfirm(transaction)}
                    >
                      Confirmer
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<CancelOutlinedIcon />}
                      disabled={processingId === transaction.id}
                      onClick={() => handleReject(transaction)}
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
