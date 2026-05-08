import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Pagination,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Business, Shield } from "@mui/icons-material";

import Chip from "@mui/material/Chip";
import PulseLoader from "react-spinners/PulseLoader";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { UseAuth } from "../../../Api/AuthContext";
import { tokenTheme } from "../../../theme";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAllowAccess } from "../../../Hook/useAllowAccess";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";
import StoreExamen from "./StoreExamen";

function ExamenIndex() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const { activeId, activeType } = UseAuth();
  const isLigueUser = activeType === "Ligue";

  const theme = useTheme();
  const colors = tokenTheme(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const { allowAccess } = useAllowAccess();
  const navigate = useNavigate();
  const GetExamens = useCallback(
    async (page = 1) => {
      if (!activeId) return;
      setLoading(true);
      setError("");
      try {
        const response = await Instance(
          `/api/examens?page=${page}&organisateur_id=${activeId}&organisateur_type=${activeType}`,
        );
        console.log(response);
        const examen = response.data.examens || [];

        const examenArray = examen.data ? examen.data : examen;
        setExamens(examenArray);
        setPagination({
          currentPage: examen.current_page,
          lastPage: examen.last_page,
          perPage: examen.per_page,
          total: examen.total,
        });
      } catch (error) {
        console.error(error);
        setError("Erreur lors de la récupération des examens");
      } finally {
        setLoading(false);
      }
    },
    [activeId, activeType],
  );

  useEffect(() => {
    GetExamens();
  }, [GetExamens]);

  //status
  const statusConfig = {
    0: { color: "primary", label: "Planifié" },
    1: { color: "warning", label: "En Cours" },
    2: { color: "success", label: "Terminé" },
    3: { color: "error", label: "Annulé" },
  };

  if (error) {
    return (
      <ErrorBlock
        message="Impossible de charger les examens"
        onRetry={GetExamens}
      />
    );
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Box
        sx={{
          Height: "50px",
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `linear-gradient(120deg, ${colors.primary[500]}, ${colors.zinc[300]})`,
          color: "white",
          px: 2,
        }}
      >
        {/* Texte section */}
        <motion.div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: { xs: "center", md: "left" },
          }}
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", fontSize: { xs: 24, md: 32 } }}
          >
            Organisez et gérez vos examens d’arts martiaux en toute
            simplicité{" "}
          </Typography>

          <Typography
            variant="h5"
            sx={{ mt: 2, opacity: 0.9, fontSize: { xs: 10, md: 16 } }}
          >
            Planifiez les passages de grade, suivez les candidats et centralisez
            toutes vos données sur une seule plateforme — rapide, fiable et
            sécurisée.
          </Typography>

          {allowAccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="contained"
                sx={{
                  m: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  backgroundColor: "success.main",
                  fontSize: { xs: 8, md: 24 },
                  textTransform: "none",
                }}
                onClick={handleOpenModal}
              >
                creer un examen
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Image section */}
        {!isMobile && (
          <motion.div
            style={{
              display: { xs: "none", md: "block" },
              flex: 1,
              width: "100%",
              height: "250px",
              borderRadius: "16px",
              backgroundImage: `url('/slogan2.jpeg')`,

              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              marginTop: "30px",
            }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </Box>

      {loading ? (
        <ConfigSkeleton />
      ) : examens.length > 0 ? (
        <Grid container spacing={2} sx={{ pb: 2 }}>
          {examens.map((examen, index) => {
            const currentStatus =
              statusConfig[examen.status] || statusConfig.draft;

            // On vérifie si c'est la Ligue ou un Club
            const isLeague = examen.organisateur_type === "Ligue";

            return (
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                  mx: "auto",
                }}
                minHeight={220}
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={examen.id}
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    width: "100%",
                    textAlign: "left", // Passage en alignement gauche pour plus de lisibilité
                    bgcolor: "background.default",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    borderTop: `4px solid ${isLeague ? "#1976d2" : "#4caf50"}`, // Barre de couleur en haut
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-5px)" },
                  }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  onClick={() => {
                    const routePrefix = isLigueUser
                      ? "/dashboard/league"
                      : "/dashboard/examen";
                    navigate(`${routePrefix}/${examen.id}/show`);
                  }}
                >
                  {/* Badge de Type (Ligue vs Club) */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Chip
                      icon={isLeague ? <Shield /> : <Business />}
                      label={isLeague ? "LIGUE" : "CLUB"}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                        color: isLeague ? "primary.main" : "success.main",
                        borderColor: isLeague ? "primary.main" : "success.main",
                      }}
                    />
                    <Chip
                      label={currentStatus?.label}
                      color={currentStatus?.color}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      fontSize: { xs: 14, md: 16 },
                      fontWeight: "bold",
                      color: "text.primary",
                    }}
                  >
                    {examen?.next_grade?.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 2, fontSize: "0.85rem" }}
                  >
                    {dayjs(examen?.start_date).format("DD MMMM YYYY")}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Info sur l'Organisateur */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {examen?.organisateur?.logo ? (
                      <Avatar
                        src={examen.organisateur.logo}
                        variant="rounded"
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: isLeague ? "primary.light" : "success.light",
                        }}
                      >
                        {examen?.organisateur?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      {examen?.organisateur?.name}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            textAlign: "center",
            opacity: 0.8,
          }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 60, mb: 2, color: "text.secondary" }}
          />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Aucun examen disponible
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Il semblerait qu'il n'y ait pas encore un examen programmé.
          </Typography>
        </Box>
      )}
      {/* modal */}
      <StoreExamen open={openModal} handleClose={handleCloseModal} />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => GetExamens(value)}
            color="primary"
          />
        )}
      </Box>
    </Box>
  );
}

export default ExamenIndex;
