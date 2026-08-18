import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { green, blue, red, purple, orange, teal, indigo } from "@mui/material/colors";
import {
  Groups,
  School,
  PeopleAlt,
  Person,
  MonetizationOn,
  Star,
  MoneyOff,
  TrendingUp,
  AccountBalanceWallet,
  EventBusy,
  PersonAddAlt,
  EventAvailable,
  MilitaryTech,
} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import Barcharts from "./Admin/Barcharts";
// import AbonnementActif from "../../Saas/pages/AbonnementActif";
import { motion } from "framer-motion";
import { UseAuth } from "../../Api/AuthContext";
import RevenueChart from "../../Saas/pages/RevenueChart";
import GradeDistributionChart from "./GradeDistributionChart";
import PendingPaymentsWidget from "./PendingPaymentsWidget";
import Activity from "../../Saas/pages/ActivityFeed";
import Program from "../../Saas/pages/Program";
import StatCard from "./StatCard";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";
import ErrorBlock from "../../Saas/pages/ErrorBlock";
import QuickActions from "../../Saas/pages/QuickActions";
import LinkIcon from "@mui/icons-material/Link";
import ErrorGlobal from "../ErrorGlobal";
import Message from "../../Saas/pages/Message";
import PaymentDeclarationDialog from "../../Saas/pages/Paiement/Paymentdeclarationdialog";
import ClubAlerts from "./ClubAlerts";
function ClubAdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_instructors: 0,
    total_parents: 0,
    total_secretaries: 0,
  });

  const { activeId, currentClub, updateAuth } = UseAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [invitationCode, setInvitationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorStats, setErrorStats] = useState("");
  const [success, setSuccess] = useState("");

  const [affiliationStatus, setAffiliationStatus] = useState(null);
  const [showAffiliationDialog, setShowAffiliationDialog] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    if (!activeId) return;
    try {
      const response = await Instance.get("/api/dashboard/club/alert");
      setAlerts(response.data.alerts || []);
    } catch {
      // Silencieux : les cartes affichent simplement 0 si les alertes sont indisponibles
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      fetchAlerts();
    }
  }, [activeId, fetchAlerts]);

  const getAlert = (type) => alerts.find((a) => a.type === type) || {};

  const fetchAffiliationStatus = useCallback(async () => {
    if (!activeId) return;
    try {
      const response = await Instance.get("/api/transactions/mon-statut-affiliation");
      setAffiliationStatus(response.data.data);
    } catch {
      // Silencieux : l'alerte ne s'affiche simplement pas si le statut est indisponible
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      fetchAffiliationStatus();
    }
  }, [activeId, fetchAffiliationStatus]);

  const fetchStats = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    setErrorStats("");
    try {
      const response = await Instance.get(`/api/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      setErrorStats("Erreur lors de la récupération des statistiques");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      fetchStats();
    }
  }, [activeId, fetchStats]);

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) return;
    setSubmitting(true);
    setSuccess("");
    setError({});

    try {
      const response = await Instance.post("/api/clubs/rejoindre-ligue", {
        invitation_code: invitationCode,
      });
      if (response.data.success) {
        const { user, clubs, leagues } = response.data;
        updateAuth({
          user,
          clubs,
          leagues,
          activeContext: { type: "Club", id: user.current_club_id },
        });
        //success
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (errorStats)
    return (
      <ErrorBlock
        message="Impossible de charger les statistiques"
        onRetry={fetchStats}
      />
    );
  return (
    <Box sx={{ mt: 1, px: 2 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Dashboard {currentClub?.name}
        </Typography>

        {currentClub?.league_id ? (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label={currentClub.league_name}
            size="small"
            sx={{
              bgcolor: "success.lighter",
              color: "success.dark",
              fontWeight: 600,
              "& .MuiChip-icon": { color: "success.main" },
            }}
          />
        ) : (
          <Chip
            icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
            label="Club indépendant"
            size="small"
            sx={{
              bgcolor: "error.lighter",
              color: "error.dark",
              fontWeight: 600,
              "& .MuiChip-icon": { color: "error.main" },
            }}
          />
        )}
      </Box>

      {/* BANNIÈRE D'AFFILIATION (S'affiche UNIQUEMENT si l'affiliation est requise) */}
      {affiliationStatus?.requise && (
        <Card
          sx={{
            mb: 4,
            bgcolor: "background.default",
            borderLeft: "5px solid #d32f2f",
            boxShadow: 1,
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <WarningAmberIcon color="error" />
              <Typography variant="h6" fontWeight="bold" color="error">
                {affiliationStatus.payment?.status === "declared"
                  ? "Affiliation en attente de vérification"
                  : "Affiliation requise"}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, maxWidth: "700px" }}
            >
              {affiliationStatus.payment?.status === "declared"
                ? "Votre paiement a été déclaré et est en attente de vérification par votre fédération."
                : `Votre club doit renouveler son affiliation pour la saison ${affiliationStatus.saison}. Montant dû : ${Number(
                    affiliationStatus.payment?.amount || 0,
                  ).toLocaleString()} XOF.`}
            </Typography>

            {affiliationStatus.payment?.status !== "declared" && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setShowAffiliationDialog(true)}
              >
                Payer mon affiliation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2. BANNIÈRE D'INVITATION (S'affiche UNIQUEMENT si le club n'a pas de ligue) */}
      {!currentClub?.league_id && (
        <Card
          sx={{
            mb: 4,
            bgcolor: "background.default",
            borderLeft: "5px solid #fbc02d",
            boxShadow: 1,
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LinkIcon color="warning" />
              <Typography variant="h6" fontWeight="bold" color="secondary">
                Rattachement à votre Ligue Régionale
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, maxWidth: "700px" }}
            >
              Demandez le <strong>Code d'invitation</strong> à votre Ligue. Une
              fois saisi, votre club sera officiellement lié pour la gestion des
              licences et championnats.
            </Typography>

            {success && <Message text={success} type="success" />}
            {error?.general && <Message text={error.general} type="error" />}

            <Box
              component="form"
              onSubmit={handleJoinLeague}
              sx={{ display: "flex", gap: 2, maxWidth: "450px" }}
            >
              <TextField
                size="small"
                label="Code Ligue (Ex: LIG-XXXX)"
                variant="outlined"
                fullWidth
                value={invitationCode}
                onChange={(e) =>
                  setInvitationCode(e.target.value.toUpperCase())
                }
                disabled={submitting}
                inputProps={{ style: { fontFamily: "monospace" } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="warning"
                disabled={submitting || !invitationCode}
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
              >
                {submitting ? "Vérification..." : "Rejoindre"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Élèves Actifs"
              value={stats.total_students || 0}
              icon={<School />}
              color={blue}
              subtitle="Inscrits dans le club"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Recettes (Mois)"
              value={`${stats.total_collected ? parseFloat(stats.total_collected).toLocaleString() : 0} XOF`}
              icon={<TrendingUp />}
              color={green}
              subtitle="Argent réellement encaissé"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              onClick={() => navigate("/dashboard/dettes")}
              sx={{ cursor: "pointer" }}
            >
              <StatCard
                title="Dettes Totales"
                value={`${stats.total_debts ? parseFloat(stats.total_debts).toLocaleString() : 0} XOF`}
                icon={<MoneyOff />}
                color={red}
                subtitle="Reste à recouvrer — voir le détail"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Équipe encadrante"
              value={
                (stats.total_instructors || 0) + (stats.total_secretaries || 0)
              }
              icon={<PeopleAlt />}
              color={purple}
              subtitle={`${stats.total_instructors || 0} instructeur${stats.total_instructors > 1 ? "s" : ""} · ${stats.total_secretaries || 0} secrétaire${stats.total_secretaries > 1 ? "s" : ""}`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Abonnements à renouveler"
              value={getAlert("abonnements_expirants").count || 0}
              icon={<EventBusy />}
              color={orange}
              subtitle="Échéance sous 15 jours"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Effectif (mois)"
              value={
                (getAlert("evolution_effectif").nouveaux || 0) -
                (getAlert("evolution_effectif").decrocheurs || 0)
              }
              icon={<PersonAddAlt />}
              color={teal}
              subtitle={`${getAlert("evolution_effectif").nouveaux || 0} nouveaux · ${getAlert("evolution_effectif").decrocheurs || 0} partis`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Taux de présence"
              value={`${getAlert("presence_risque").rate ?? 0}%`}
              icon={<EventAvailable />}
              color={blue}
              subtitle={`${getAlert("presence_risque").count || 0} élève(s) à risque (30j)`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Prochain examen"
              value={getAlert("examen_grade").count || 0}
              icon={<MilitaryTech />}
              color={indigo}
              subtitle={
                getAlert("examen_grade").date
                  ? `Candidats · ${new Date(getAlert("examen_grade").date).toLocaleDateString()}`
                  : "Aucun examen programmé"
              }
            />
          </Grid>
        </Grid>
      </motion.div>

      <ClubAlerts alerts={alerts} />

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <RevenueChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <Barcharts />
        </Grid>
        <Grid item xs={12} md={6}>
          <GradeDistributionChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <PendingPaymentsWidget />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, mb: 2 }}>
        <Program activeId={activeId} role="admin" />
        <Activity />
        <QuickActions />
      </Box>

      <PaymentDeclarationDialog
        open={showAffiliationDialog}
        payment={affiliationStatus?.payment}
        declarerEndpoint={
          affiliationStatus?.payment
            ? `/api/transactions/${affiliationStatus.payment.id}/declarer`
            : null
        }
        organisateurId={affiliationStatus?.payment?.organisateur_id}
        organisateurType={affiliationStatus?.payment?.organisateur_type}
        onClose={() => setShowAffiliationDialog(false)}
        onSuccess={() => {
          setShowAffiliationDialog(false);
          fetchAffiliationStatus();
        }}
        setToast={setToast}
      />

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

export default ClubAdminDashboard;
