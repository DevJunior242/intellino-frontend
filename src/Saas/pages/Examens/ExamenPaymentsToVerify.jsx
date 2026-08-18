import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack,
  Skeleton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  PaymentsOutlined as PaymentsOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Instance } from "../../../Api/Axios";

const PROVIDER_LABELS = {
  orange_money: { label: "Orange Money", color: "#FF6600" },
  moov_money: { label: "Moov Money", color: "#0066B3" },
  wave: { label: "Wave", color: "#1DC8E0" },
  virement_bancaire: { label: "Virement", color: "#37474F" },
};

function ExamenPaymentLotCard({ lot, onConfirm, onReject, processing }) {
  const [expanded, setExpanded] = useState(false);
  const rawProvider = lot.payment_method?.provider ?? null;
  const provider = PROVIDER_LABELS[rawProvider] || {
    label: rawProvider || "Non renseigné",
    color: "#616161",
  };
  const nbCandidats = lot.items?.length || 0;

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {lot.club?.name || "Club"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {nbCandidats} candidat{nbCandidats > 1 ? "s" : ""} · déclaré le{" "}
              {lot.declared_at
                ? new Date(lot.declared_at).toLocaleDateString("fr-FR")
                : "—"}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {Number(lot.amount || 0).toLocaleString("fr-FR")}
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              FCFA
            </Typography>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
          <Chip
            label={provider.label}
            size="small"
            sx={{ bgcolor: provider.color, color: "#fff", fontWeight: 700, fontSize: "0.7rem" }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
            depuis {lot.sender_number}
          </Typography>
        </Stack>

        {lot.transaction_id && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            Réf : {lot.transaction_id}
          </Typography>
        )}

        <Button
          size="small"
          onClick={() => setExpanded((e) => !e)}
          endIcon={
            <ExpandMoreIcon
              sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            />
          }
          sx={{ textTransform: "none", mt: 1, px: 0 }}
        >
          {expanded ? "Masquer" : "Voir"} les candidats
        </Button>

        {expanded && (
          <Box sx={{ mt: 1 }}>
            {(lot.items || []).map((item) => (
              <Typography key={item.id} variant="body2" sx={{ fontSize: "0.82rem", py: 0.25 }}>
                {item.examenCandidat?.student?.fullname || "Candidat"}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          size="small"
          startIcon={<CheckCircleIcon fontSize="small" />}
          onClick={() => onConfirm(lot)}
          disabled={processing}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: "#2E7D32",
            color: "#fff",
            "&:hover": { bgcolor: "#1B5E20" },
          }}
        >
          Confirmer
        </Button>
        <Button
          size="small"
          startIcon={<CancelIcon fontSize="small" />}
          onClick={() => onReject(lot)}
          disabled={processing}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, color: "#EF5350" }}
        >
          Rejeter
        </Button>
      </CardActions>
    </Card>
  );
}

export default function ExamenPaymentsToVerify() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchPendingLots = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await Instance.get("/api/transactions/a-verifier", {
        params: { payable_type: "examen" },
      });
      setLots(data.data || []);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingLots();
  }, [fetchPendingLots]);

  const handleConfirm = async (lot) => {
    setProcessingId(lot.id);
    try {
      await Instance.patch(`/api/transactions/${lot.id}/confirmer`);
      setLots((prev) => prev.filter((l) => l.id !== lot.id));
      setToast({ open: true, message: "Paiement confirmé.", severity: "success" });
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (lot) => {
    setProcessingId(lot.id);
    try {
      await Instance.patch(`/api/transactions/${lot.id}/rejeter`);
      setLots((prev) => prev.filter((l) => l.id !== lot.id));
      setToast({ open: true, message: "Déclaration rejetée.", severity: "success" });
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur.",
        severity: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Skeleton height={140} sx={{ borderRadius: 3, mb: 3 }} />;
  }

  if (lots.length === 0) return null;

  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <PaymentsOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Paiements d'examens à vérifier
        </Typography>
        <Chip
          label={lots.length}
          size="small"
          sx={{ bgcolor: "primary.lighter", color: "primary.main", fontWeight: 700, height: 20, fontSize: "0.7rem" }}
        />
      </Stack>
      <Grid container spacing={2}>
        {lots.map((lot) => (
          <Grid item xs={12} sm={6} key={lot.id}>
            <ExamenPaymentLotCard
              lot={lot}
              onConfirm={handleConfirm}
              onReject={handleReject}
              processing={processingId === lot.id}
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
