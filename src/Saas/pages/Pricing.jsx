import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import PaymentDeclarationDialog from "./Paiement/Paymentdeclarationdialog";

const SECTIONS = [
  { type: "Club", label: "Club", unite: "élèves actifs" },
  { type: "Ligue", label: "Ligue", unite: "membres actifs (tous clubs affiliés)" },
  { type: "Federation", label: "Fédération", unite: "membres actifs au niveau national" },
];

function formatFcfa(amount) {
  return Number(amount).toLocaleString("fr-FR");
}

function TierRange({ plan }) {
  if (plan.max_users == null) return `${plan.min_users}+`;
  return `${plan.min_users}–${plan.max_users}`;
}

// Détermine ce qu'affiche/fait le bouton d'une carte selon l'abonnement
// actuel de l'organisation (aucun, un autre palier, ou celui-ci) — c'est ce
// qui garantit que cliquer sur une carte agit toujours sur CE palier-là,
// jamais sur un autre abonnement en attente ailleurs.
function getCardState(plan, mySubscription) {
  if (!mySubscription) return { action: "new", label: "Commencer", disabled: false };

  const isCurrentPlan = mySubscription.plan_id === plan.id;
  const hasDeclaredPayment = mySubscription.payments?.some((p) => p.status === "declared");

  if (isCurrentPlan) {
    if (mySubscription.status === "paid") {
      return { action: "current", label: "Palier actuel", disabled: true };
    }
    if (hasDeclaredPayment) {
      return { action: "verifying", label: "Vérification en cours", disabled: true };
    }
    return { action: "resume", label: "Compléter le paiement", disabled: false };
  }

  if (mySubscription.status === "pending_payment" && hasDeclaredPayment) {
    return {
      action: "blocked",
      label: "Indisponible",
      disabled: true,
      tooltip:
        "Un paiement pour votre abonnement actuel est en cours de vérification. Patientez avant de changer de palier.",
    };
  }

  return { action: "switch", label: "Changer pour ce palier", disabled: false };
}

function PlanCard({ plan, billing, discountPercent, onCommencer, subscribingId, mySubscription }) {
  const isSurMesure = plan.name.toLowerCase().includes("sur-mesure");
  const isGratuit = !isSurMesure && Number(plan.amount) === 0;
  const cardState = getCardState(plan, mySubscription);

  const monthly = Number(plan.amount);
  const annualPerMonth = monthly * (1 - discountPercent / 100);
  const displayedMonthly = billing === "annuel" ? annualPerMonth : monthly;

  return (
    <Paper
      component={motion.div}
      whileHover={{ y: -4 }}
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" fontWeight={800}>
        {plan.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>
        {plan.description}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip size="small" label={<TierRange plan={plan} />} variant="outlined" />
        {cardState.action === "current" && (
          <Chip size="small" label="Actuel" color="success" />
        )}
      </Stack>

      <Box sx={{ mb: 2 }}>
        {isSurMesure ? (
          <Typography variant="h5" fontWeight={800}>
            Nous contacter
          </Typography>
        ) : isGratuit ? (
          <Typography variant="h5" fontWeight={800} color="success.main">
            Gratuit
          </Typography>
        ) : (
          <>
            <Typography variant="h4" fontWeight={800}>
              {formatFcfa(displayedMonthly)}{" "}
              <Typography component="span" variant="body2" color="text.secondary">
                FCFA / mois
              </Typography>
            </Typography>
            {billing === "annuel" && discountPercent > 0 && (
              <Typography variant="caption" color="success.main" fontWeight={700}>
                -{discountPercent}% — facturé annuellement
              </Typography>
            )}
          </>
        )}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant={isSurMesure || cardState.action === "current" ? "outlined" : "contained"}
        fullWidth
        sx={{ textTransform: "none", mt: 1 }}
        disabled={subscribingId === plan.id || (!isSurMesure && cardState.disabled)}
        title={!isSurMesure ? cardState.tooltip : undefined}
        {...(isSurMesure
          ? { href: "/contact" }
          : { onClick: () => onCommencer(plan) })}
      >
        {isSurMesure
          ? "Nous contacter"
          : subscribingId === plan.id
            ? "Création..."
            : cardState.label}
      </Button>
    </Paper>
  );
}

export default function Pricing() {
  const { auth } = UseAuth();
  const isLogged = auth?.isLogin === true;

  const [plans, setPlans] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState("mensuel");

  const [subscribingId, setSubscribingId] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Abonnement actuel de l'organisation active (en attente de paiement, en
  // vérification, ou déjà actif) — sert à afficher le bon état sur chaque
  // carte (Commencer / Compléter le paiement / Changer pour ce palier /
  // Palier actuel) plutôt que d'agir sur "l'abonnement en attente" au sens
  // large sans savoir de quel palier il s'agit.
  const [mySubscription, setMySubscription] = useState(null);

  const fetchMySubscription = () => {
    if (!isLogged) return;
    Instance.get("/api/subscriptions")
      .then(({ data }) => {
        const rows = data?.subscriptions?.data || [];
        const current = rows.find(
          (s) => s.status === "pending_payment" || s.status === "paid",
        );
        setMySubscription(current || null);
      })
      .catch(() => {
        // Silencieux : l'absence de bannière n'empêche pas la page de fonctionner.
      });
  };

  useEffect(() => {
    Promise.all([
      Instance.get("/api/public/plans"),
      Instance.get("/api/public/annual-discount"),
    ])
      .then(([plansRes, discountRes]) => {
        setPlans(plansRes.data?.plans || []);
        setDiscountPercent(discountRes.data?.percent || 0);
      })
      .catch(() => {
        // Silencieux : la page reste affichable (sections vides) plutôt que de planter.
      })
      .finally(() => setLoading(false));

    fetchMySubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommencer = async (plan) => {
    if (!isLogged) {
      window.location.href = "/register";
      return;
    }

    const cardState = getCardState(plan, mySubscription);
    if (cardState.disabled) return;

    if (cardState.action === "resume") {
      setActiveSubscription(mySubscription);
      setDeclareOpen(true);
      return;
    }

    // "new" (aucun abonnement) ou "switch" (changement de palier) passent
    // tous les deux par la même création — le backend annule l'ancien
    // abonnement s'il y en a un différent.
    setSubscribingId(plan.id);
    try {
      const { data } = await Instance.post("/api/subscriptions", { plan_id: plan.id });
      setActiveSubscription(data.subscription);
      setMySubscription(data.subscription);
      setDeclareOpen(true);
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Impossible de créer l'abonnement.",
        severity: "error",
      });
      fetchMySubscription();
    } finally {
      setSubscribingId(null);
    }
  };

  const hasDeclaredPayment = mySubscription?.payments?.some(
    (p) => p.status === "declared",
  );

  const plansParType = useMemo(() => {
    const groupes = {};
    plans.forEach((p) => {
      if (!groupes[p.organisateur_type]) groupes[p.organisateur_type] = [];
      groupes[p.organisateur_type].push(p);
    });
    return groupes;
  }, [plans]);

  return (
    <Box sx={{ mt: 10, mb: 10, px: { xs: 2, md: 6 } }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h3" component="h1" textAlign="center" fontWeight={800} gutterBottom>
          Nos Tarifs
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ maxWidth: 640, mx: "auto", mb: 4 }}
        >
          Un tarif adapté à votre structure — club, ligue ou fédération — basé
          simplement sur votre nombre d'utilisateurs actifs.
        </Typography>

        {mySubscription && mySubscription.status === "pending_payment" && (
          <Alert
            severity={hasDeclaredPayment ? "info" : "warning"}
            sx={{ maxWidth: 640, mx: "auto", mb: 4 }}
            action={
              !hasDeclaredPayment && (
                <Button
                  color="inherit"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 700 }}
                  onClick={() => {
                    setActiveSubscription(mySubscription);
                    setDeclareOpen(true);
                  }}
                >
                  Compléter le paiement
                </Button>
              )
            }
          >
            {hasDeclaredPayment
              ? `Votre paiement pour "${mySubscription.plan?.name}" (${formatFcfa(mySubscription.amount)} FCFA) est en cours de vérification.`
              : `Vous avez un abonnement en attente de paiement : "${mySubscription.plan?.name}" (${formatFcfa(mySubscription.amount)} FCFA).`}
          </Alert>
        )}

        {mySubscription && mySubscription.status === "paid" && (
          <Alert severity="success" sx={{ maxWidth: 640, mx: "auto", mb: 4 }}>
            {`Abonnement actif : "${mySubscription.plan?.name}" (${formatFcfa(mySubscription.amount)} FCFA/mois). Choisissez un autre palier ci-dessous pour en changer.`}
          </Alert>
        )}

        <Stack direction="row" justifyContent="center" sx={{ mb: 6 }}>
          <ToggleButtonGroup
            exclusive
            value={billing}
            onChange={(e, value) => value && setBilling(value)}
          >
            <ToggleButton value="mensuel" sx={{ textTransform: "none", px: 3 }}>
              Mensuel
            </ToggleButton>
            <ToggleButton value="annuel" sx={{ textTransform: "none", px: 3 }}>
              Annuel
              {discountPercent > 0 && (
                <Chip
                  size="small"
                  color="success"
                  label={`-${discountPercent}%`}
                  sx={{ ml: 1 }}
                />
              )}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </motion.div>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        SECTIONS.map((section) => (
          <Box key={section.type} sx={{ mb: 7 }}>
            <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight={800}>
                {section.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (tarification basée sur le nombre de {section.unite})
              </Typography>
            </Stack>
            <Grid container spacing={2.5}>
              {(plansParType[section.type] || []).map((plan) => (
                <Grid item xs={12} sm={6} md={3} key={plan.id}>
                  <PlanCard
                    plan={plan}
                    billing={billing}
                    discountPercent={discountPercent}
                    onCommencer={handleCommencer}
                    subscribingId={subscribingId}
                    mySubscription={mySubscription}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
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
          fetchMySubscription();
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
