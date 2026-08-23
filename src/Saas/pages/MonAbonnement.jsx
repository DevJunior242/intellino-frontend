import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Instance } from "../../Api/Axios";
import PaymentDeclarationDialog from "./Paiement/Paymentdeclarationdialog";

function formatFcfa(amount) {
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

const STATUS_META = {
  pending_payment: { label: "En attente de paiement", color: "warning" },
  paid: { label: "Actif", color: "success" },
  expired: { label: "Expiré", color: "default" },
  cancelled: { label: "Remplacé par un changement de palier", color: "default" },
};

function SubscriptionRow({ subscription, onDeclarer }) {
  const meta = STATUS_META[subscription.status] || {
    label: subscription.status,
    color: "default",
  };
  const hasDeclaredPayment = subscription.payments?.some(
    (p) => p.status === "declared",
  );
  const canDeclare = subscription.status === "pending_payment" && !hasDeclaredPayment;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
      }}
    >
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            {subscription.plan?.name || "Abonnement"}
          </Typography>
          <Chip size="small" label={meta.label} color={meta.color} />
          {subscription.status === "pending_payment" && hasDeclaredPayment && (
            <Chip size="small" label="Vérification en cours" variant="outlined" />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {formatFcfa(subscription.amount)} FCFA — du {formatDate(subscription.start_date)} au{" "}
          {formatDate(subscription.end_date)}
        </Typography>
      </Box>

      {canDeclare && (
        <Button
          variant="contained"
          size="small"
          sx={{ textTransform: "none", fontWeight: 700 }}
          onClick={() => onDeclarer(subscription)}
        >
          Compléter le paiement
        </Button>
      )}
    </Paper>
  );
}

export default function MonAbonnement() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchSubscriptions = useCallback(() => {
    setLoading(true);
    Instance.get("/api/subscriptions")
      .then(({ data }) => setSubscriptions(data?.subscriptions?.data || []))
      .catch(() => {
        // Silencieux : la page reste affichable (liste vide) plutôt que de planter.
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleDeclarer = (subscription) => {
    setActiveSubscription(subscription);
    setDeclareOpen(true);
  };

  const current =
    subscriptions.find((s) => s.status === "paid") ||
    subscriptions.find((s) => s.status === "pending_payment");

  return (
    <Box sx={{ maxWidth: 820 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        Mon abonnement
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Abonnement de votre organisation à la plateforme Intellino.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!current && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 700 }}
                  onClick={() => navigate("/pricing")}
                >
                  Voir les tarifs
                </Button>
              }
            >
              Vous n'avez pas encore d'abonnement Intellino.
            </Alert>
          )}

          {subscriptions.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                Historique
              </Typography>
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                {subscriptions.map((subscription) => (
                  <SubscriptionRow
                    key={subscription.id}
                    subscription={subscription}
                    onDeclarer={handleDeclarer}
                  />
                ))}
              </Stack>
            </>
          )}

          <Divider sx={{ mb: 3 }} />

          <Button
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 700 }}
            onClick={() => navigate("/pricing")}
          >
            Voir les tarifs / changer de palier
          </Button>
        </>
      )}

      <PaymentDeclarationDialog
        open={declareOpen}
        payment={activeSubscription}
        declarerEndpoint={
          activeSubscription ? `/api/subscriptions/${activeSubscription.id}/declarer` : null
        }
        methodsEndpoint="/api/platform-payment-methods"
        methodFieldName="platform_payment_method_id"
        onClose={() => setDeclareOpen(false)}
        onSuccess={() => {
          setActiveSubscription(null);
          fetchSubscriptions();
        }}
        setToast={setToast}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
