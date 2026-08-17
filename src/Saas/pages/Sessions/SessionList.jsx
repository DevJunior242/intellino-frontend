import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Pagination,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Chip from "@mui/material/Chip";
import PulseLoader from "react-spinners/PulseLoader";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import { Schedule } from "@mui/icons-material";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import EditSession from "./EditSession";
import ErrorBlock from "../ErrorBlock";
function SessionList() {
  const [sessions, setsessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { activeRole, activeId, activeType } = UseAuth();

  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const [errorSessions, setErrorSessions] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [selectedSession, setSelectedSession] = useState(null);

  const handleOpenModal = (session) => {
    setSelectedSession(session);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSession(null);
  };

  const allowAccess = ["admin_club", "instructeur", "super_admin"].includes(
    activeRole,
  );
  const navigate = useNavigate();
  //obtenir les tournois
  const getSession = useCallback(
    async (page = 1) => {
      if (!activeId) return;
      setLoading(true);
      setErrorSessions("");
      try {
        const response = await Instance(`/api/sessions?page=${page}`);
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
        setErrorSessions("Erreur lors de la récupération des sessions");
      } finally {
        setLoading(false);
      }
    },
    [activeId],
  );
  useEffect(() => {
    getSession();
  }, [getSession]);

  //supprimer une session
  const handleDelete = async (sessionId) => {
    if (!window.confirm(`Supprimer la session ${sessionId} ?`) || !activeId)
      return;
    setError({});
    setSuccess("");
    try {
      const response = await Instance.delete(
        `/api/sessions/remove/${sessionId}?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log("Réponse API après suppression :", response.data);
      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
        getSession();
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    }
  };

  //status
  const statusConfig = {
    0: { color: "primary", label: "Planifié" }, // STATUS_SCHEDULED
    1: { color: "warning", label: "En Cours" }, // STATUS_ONGOING
    2: { color: "success", label: "Terminé" }, // STATUS_COMPLETED
    3: { color: "error", label: "Annulé" }, // STATUS_CANCELLED
    4: { color: "secondary", label: "Reporté" }, // STATUS_POSTPONED
  };
  if (errorSessions)
    return (
      <ErrorBlock
        message="Impossible de charger les sessions"
        onRetry={getSession}
      />
    );

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", width: "100%", mt: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          m: 2,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: 12, md: 20 } }}
        >
          Liste des cours
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/dashboard/course/store"
          sx={{ textTransform: "none" }}
        >
          Programmer cours
        </Button>
      </Box>
      {success && <Message text={success} type="success" />}
      {error?.general && <Message text={error.general} type="error" />}

      {loading ? (
        <ConfigSkeleton />
      ) : sessions.length > 0 ? (
        <Grid
          container
          spacing={3}
          alignItems="stretch"
          sx={{ pb: 2, justifyContent: "center" }}
        >
          {sessions.map((session, index) => {
            const currentStatus =
              statusConfig[session.status] || statusConfig.draft;
            return (
              <Grid
                key={session.id}
                item
                xs={12}
                sm={6}
                md={6}
                lg={4}
                xl={3}
                sx={{
                  display: "flex",
                  minWidth: 0,
                }}
              >
                <Paper
                  component={motion.div}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.06 }}
                  elevation={0}
                  sx={{
                    backgroundColor: "background.default",
                    p: 3,
                    width: "300px",
                    overflow: "hidden",
                    borderRadius: 3,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() =>
                    navigate(
                      `/dashboard/session/${session.id}/show?organisateur_id=${session?.course?.organisateur_id}`,
                    )
                  }
                >
                  {/* Header: Title + Status */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: 13, md: 16 },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "2.6em",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {session.course?.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: 5, md: 10 },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "2.6em",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                        color: "text.secondary",
                      }}
                    >
                      session: {session.title}
                    </Typography>
                    <Chip
                      label={currentStatus?.label}
                      color={currentStatus?.color}
                      size="small"
                      sx={{ mt: 1, fontWeight: 600, fontSize: 11 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Infos */}
                  <Stack spacing={1.2} sx={{ flexGrow: 1 }}>
                    {/* Club */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ fontSize: 13 }}
                      >
                        {session.course?.club?.name}
                      </Typography>
                    </Box>

                    {/* Date */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2" sx={{ fontSize: 13 }}>
                        {session.session_date}
                      </Typography>
                    </Box>

                    {/* Time */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2" sx={{ fontSize: 13 }}>
                        {session.start_time.slice(0, 5)} –{" "}
                        {session.end_time.slice(0, 5)}
                      </Typography>
                    </Box>

                    {/* Level */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2" sx={{ fontSize: 13 }}>
                        {session.course?.grade?.name}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Actions */}
                  {allowAccess && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          flex: 1,
                          fontSize: 12,
                          textTransform: "none",
                          borderRadius: 2,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("click bouton", session);
                          handleOpenModal(session);
                        }}
                        disabled={session.status !== 0}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          flex: 1,
                          fontSize: 12,
                          textTransform: "none",
                          borderRadius: 2,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session.id);
                        }}
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  )}
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
      {selectedSession && (
        <EditSession
          open={openModal}
          handleClose={handleCloseModal}
          session={selectedSession}
          getSession={getSession}
          activeId={activeId}
        />
      )}
    </Box>
  );
}

export default SessionList;
