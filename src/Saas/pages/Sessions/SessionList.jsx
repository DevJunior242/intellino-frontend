import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Pagination,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import Chip from "@mui/material/Chip";
import PulseLoader from "react-spinners/PulseLoader";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import { Schedule } from "@mui/icons-material";
import ConfigSkeleton from "../ConfigSkeleton";
function SessionList() {
  const [sessions, setsessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { activeRole, activeClubId } = UseAuth();

  const allowAccess = [
    "admin_club",
    "instructeur",
    "secretaire",
    "super_admin",
  ].includes(activeRole);
  const navigate = useNavigate();
  //obtenir les tournois
  const getSession = useCallback(
    async (page = 1) => {
      if (!activeClubId) return;
      setLoading(true);
      try {
        const response = await Instance(
          `/api/sessions?page=${page}&club_id=${activeClubId}`,
        );
        console.log(response);
        const session = response.data.sessions || [];
        const sessionArray = session.data ? session.data : session;
        setsessions(sessionArray);
        setPagination({
          currentPage: session.current_page,
          lastPage: session.last_page,
          perPage: session.per_page,
          total: session.total,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [activeClubId],
  );
  useEffect(() => {
    getSession();
  }, [getSession]);

  //status
  const statusConfig = {
    scheduled: { color: "primary", label: "Planifié" },
    ongoing: { color: "warning", label: "En Cours" },
    completed: { color: "success", label: "Terminé" },
    cancelled: { color: "error", label: "Annulé" },
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", width: "100%", mt: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Liste des sessions
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/dashboard/course/store"
          sx={{ textTransform: "none" }}
        >
          Programmer une session
        </Button>
      </Box>

      {loading ? (
        <ConfigSkeleton />
      ) : sessions.length > 0 ? (
        <Grid container spacing={2} sx={{ pb: 2 }}>
          {sessions.map((session, index) => {
            const currentStatus =
              statusConfig[session.status] || statusConfig.draft;

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
                key={session.id}
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
                    navigate(
                      `/dashboard/session/${session.id}/show?club_id=${session?.course?.club_id}`,
                    )
                  }
                >
                  <Typography variant="h6" fontWeight="bold">
                    {session.course?.name}
                  </Typography>
                  {/* status */}
                  <Chip
                    label={currentStatus?.label}
                    color={currentStatus?.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />

                  {/* Club */}
                  <Typography
                    sx={{ display: "flex", alignItems: "center", mt: 1 }}
                    color="text.secondary"
                  >
                    <LocationCityIcon fontSize="small" sx={{ mr: 1 }} />
                    {session.course?.club?.name}
                  </Typography>

                  {/* Date */}
                  <Typography
                    sx={{ display: "flex", alignItems: "center", mt: 1 }}
                  >
                    <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                    {session.session_date}
                  </Typography>
                  {/* Time */}
                  <Typography
                    sx={{ display: "flex", alignItems: "center", mt: 1 }}
                  >
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                    {session.start_time.slice(0, 5)}-
                    {session.end_time.slice(0, 5)}
                  </Typography>

                  {/* Level */}
                  <Typography
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                    {session.course?.grade?.name}
                  </Typography>
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
            Aucun session disponible
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Il semblerait qu'il n'y ait pas encore de sessions programmées.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => getSession(value)}
            color="primary"
          />
        )}
      </Box>
    </Box>
  );
}

export default SessionList;
