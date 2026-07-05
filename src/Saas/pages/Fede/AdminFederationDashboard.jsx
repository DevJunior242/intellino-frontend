import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  CorporateFare,
  AccountTree,
  CardMembership,
  PriceCheck,
  HourglassTop,
  Wc,
} from "@mui/icons-material";
import { Instance } from "../../../Api/Axios";
import LicenceRevenueChart from "./LicenceRevenueChart";
import ClubsParLigueChart from "./ClubsParLigueChart";
import PromoteCode from "./PromoteCode";

// Animation de grille fluide
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function AdminFederationDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licencesAVerifier, setLicencesAVerifier] = useState(0);

  const fetchLicencesAVerifier = useCallback(async () => {
    try {
      const res = await Instance.get("/api/licence-payments", {
        params: { status: "declared" },
      });
      setLicencesAVerifier((res.data?.data || []).length);
    } catch (error) {
      console.error("Erreur licences à vérifier", error);
    }
  }, []);

  useEffect(() => {
    Instance.get("api/federation/dashboard-stats")
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error("Erreur stats", err))
      .finally(() => setLoading(false));
    fetchLicencesAVerifier();
  }, [fetchLicencesAVerifier]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#e8c84a" }} />
      </Box>
    );
  }

  const stats = data?.stats;

  // Définition de tes blocs KPI
  const kpiCards = [
    {
      title: "Ligues Régionales",
      value: stats?.total_ligues || 0,
      icon: <CorporateFare fontSize="large" />,
      color: "#4a90e2",
    },
    {
      title: "Clubs Affiliés",
      value: stats?.total_clubs || 0,
      icon: <AccountTree fontSize="large" />,
      color: "#26a69a",
    },
    {
      title: "Total Licenciés",
      value: stats?.total_licences || 0,
      icon: <CardMembership fontSize="large" />,
      color: "#e8c84a",
    },
    {
      title: "Recettes Globales",
      value: `${stats?.total_recettes?.toLocaleString()} F CFA`,
      icon: <PriceCheck fontSize="large" />,
      color: "#66bb6a",
    },
    {
      title: "Licences En Attente",
      value: stats?.licences_en_attente || 0,
      icon: <HourglassTop fontSize="large" />,
      color: "#ef5350",
    },
    {
      title: "Licences À Vérifier",
      value: licencesAVerifier,
      icon: <HourglassTop fontSize="large" />,
      color: licencesAVerifier > 0 ? "#ff9800" : "#66bb6a",
      onClick: () => navigate("/dashboard/federation/licences"),
    },
  ];

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      sx={{ p: 1 }}
    >
      {/* Bannière de la Saison Active */}
      <Box
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "#22262f",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#e8eaf0" }}>
            Tableau de Bord National
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b90a0", mt: 0.5 }}>
            Vue analytique globale de vos structures et pratiquants au Burkina
            Faso.
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: "rgba(232, 200, 74, 0.1)",
            border: "1px solid rgba(232, 200, 74, 0.2)",
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{ color: "#e8c84a", fontWeight: 700, fontSize: "0.85rem" }}
          >
            Saison :{" "}
            {data?.saison ? data?.saison?.libele : "Aucune saison active"}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ m: 2 }}>
        <PromoteCode />
      </Box>

      {/* Grille Flex/Grid des Cartes KPI */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((card, idx) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={2}
            key={idx}
            component={motion.div}
            variants={cardVariants}
          >
            <Card
              onClick={card.onClick}
              sx={{
                bgcolor: "#22262f",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 3,
                height: "100%",
                cursor: card.onClick ? "pointer" : "default",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#8b90a0",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ color: "#e8eaf0", fontWeight: 700, mt: 1 }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: card.color,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Deuxième ligne : Genre, recettes licences, clubs par ligue */}
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          md={4}
          component={motion.div}
          variants={cardVariants}
        >
          <Card
            sx={{
              bgcolor: "#22262f",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Wc sx={{ color: "#e8c84a" }} />
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#e8eaf0", fontWeight: 700 }}
                >
                  Démographie par Genre
                </Typography>
              </Stack>
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                {(stats?.hommes || 0) + (stats?.femmes || 0) === 0 ? (
                  <Typography variant="body2" sx={{ color: "#8b90a0" }}>
                    Aucun licencié pour le moment.
                  </Typography>
                ) : (
                  <PieChart
                    series={[
                      {
                        data: [
                          {
                            id: "hommes",
                            label: "Hommes (M)",
                            value: stats?.hommes || 0,
                            color: "#4a90e2",
                          },
                          {
                            id: "femmes",
                            label: "Femmes (F / Mixte)",
                            value: stats?.femmes || 0,
                            color: "#ec407a",
                          },
                        ],
                        innerRadius: 40,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    height={220}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          component={motion.div}
          variants={cardVariants}
        >
          <LicenceRevenueChart />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          component={motion.div}
          variants={cardVariants}
        >
          <ClubsParLigueChart />
        </Grid>
      </Grid>
    </Box>
  );
}
