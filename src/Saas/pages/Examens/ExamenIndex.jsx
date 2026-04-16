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
} from "@mui/material";
import { Link } from "react-router-dom";

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
function ExamenIndex() {
  const [examens, setExamens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const { activeClubId } = UseAuth();
  const theme = useTheme();
  const colors = tokenTheme(theme.palette.mode);
  const { allowAccess } = useAllowAccess();
  const navigate = useNavigate();
  const GetExamens = useCallback(
    async (page = 1) => {
      if (!activeClubId) return;
      setIsLoading(true);
      setError("");
      try {
        const response = await Instance(
          `/api/examens?page=${page}&club_id=${activeClubId}`,
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
        setIsLoading(false);
      }
    },
    [activeClubId],
  );

  useEffect(() => {
    GetExamens();
  }, [GetExamens]);

  //status
  const statusConfig = {
    scheduled: { color: "primary", label: "Planifié" },
    ongoing: { color: "warning", label: "En Cours" },
    completed: { color: "success", label: "Terminé" },
    cancelled: { color: "error", label: "Annulé" },
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
          minHeight: "80vh",
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `linear-gradient(120deg, ${colors.primary[500]}, ${colors.zinc[300]})`,
          color: "white",
          px: 4,
          py: 6,
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
            sx={{ mt: 2, opacity: 0.9, fontSize: { xs: 16, md: 24 } }}
          >
            Planifiez les passages de grade, suivez les candidats et centralisez
            toutes vos données sur une seule plateforme — rapide, fiable et
            sécurisée.{" "}
          </Typography>

          {allowAccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                component={Link}
                to="/dashboard/student/examen/store"
                variant="contained"
                sx={{
                  mt: 4,
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  backgroundColor: "success.main",
                  fontSize: { xs: 8, md: 24 },
                }}
              >
                creer un examen
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Image section */}
        <motion.div
          style={{
            display: { xs: "none", md: "block" },
            flex: 1,
            width: "100%",
            height: "350px",
            borderRadius: "16px",
            backgroundImage: `
  url('https://maliactu.net/wp-content/uploads/2025/09/542640937_806957088505277_6446405435339140521_n-600x365.jpg')
`,

            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            marginTop: "30px",
          }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        />
      </Box>
      {isLoading && <ConfigSkeleton />}

      {examens.length === 0 && (
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
            Il semblerait qu'il n'y ait pas encore de sessions programmées.
          </Typography>
        </Box>
      )}
      <Grid container spacing={2} sx={{ pb: 2 }}>
        {examens.map((examen, index) => {
          const currentStatus =
            statusConfig[examen.status] || statusConfig.draft;
          return (
            <Grid
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                mx: "auto",
                borderRadius: 2,
              }}
              minHeight={200}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={examen.id}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: "background.default",
                  cursor: "pointer",
                }}
                data-aos="fade-up"
                data-aos-delay={index * 200}
                onClick={() =>
                  navigate(`/dashboard/student/${examen.id}/candidates`)
                }
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontSize: { xs: 10, md: 14 },
                    fontWeight: "bold",
                  }}
                >
                  Examen – {examen?.current_grade?.name}{" "}
                </Typography>
                <Typography
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {dayjs(examen?.start_date).format("DD MMMM YYYY")}
                </Typography>
                <Typography
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {examen?.club?.logo && (
                    <img
                      src={examen?.club?.logo}
                      alt={examen?.club?.name}
                      style={{ width: "50px", height: "50px" }}
                    />
                  )}
                </Typography>

                <Typography
                  component={"span"}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  Status :
                  <Chip
                    label={statusConfig[examen.status]?.label}
                    color={currentStatus?.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
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
