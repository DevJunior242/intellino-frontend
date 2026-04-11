import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
} from "@mui/material";

import { useEffect, useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ConfigSkeleton from "./ConfigSkeleton";

function AttendanceIndex() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const { activeRole, activeClubId } = UseAuth();
  const getAtt = async (page = 1) => {
    setLoading(true);
    try {
      const response = await Instance.get(
        `/api/attendances?page=${page}&club_id=${activeClubId}`,
      );
      console.log(response);
      const attendance = response.data.attendances || [];
      setAttendances(attendance?.data || []);
      setPagination({
        currentPage: attendance.current_page,
        lastPage: attendance.last_page,
        perPage: attendance.per_page,
        total: attendance.total,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des attendances :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAtt();
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return { color: "success", label: "Present" };
      case "absent":
        return { color: "error", label: "Absent" };
      default:
        return { color: "default", label: status };
    }
  };
  const formatBirthdate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };
  const formaedTime = (time) => {
    const hours = time.split(":")[0];
    const minutes = time.split(":")[1];
    return `${hours}h${minutes}`;
  };

  return (
    <Box>
      <Box sx={{ mt: 8, backgroundColor: "background.default" }}>
        <Paper
          elevation={3}
          sx={{ p: 2, backgroundColor: "background.default" }}
        >
          <Typography
            variant="h5"
            component="h2"
            fontWeight={"bold"}
            gutterBottom
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: { xs: 8, md: 14 },
            }}
          >
            Liste de presence
          </Typography>

          {loading ? (
            <ConfigSkeleton />
          ) : (
            <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
              <Table stickyHeader aria-label="attendances table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Nom Complet
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Cours
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Date
                    </TableCell>

                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Heure de début
                    </TableCell>

                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Heure de fin
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Statut
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Club
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendances.length > 0 ? (
                    attendances.map((attendance) => {
                      const statusChip = getStatusColor(attendance.status);
                      return (
                        <TableRow hover key={attendance.id}>
                          <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                alt={attendance.fullname}
                                src={attendance.photo}
                                sx={{
                                  mr: 2,
                                  bgcolor:
                                    attendance.sex === "M"
                                      ? "primary.light"
                                      : "secondary.light",
                                }}
                              >
                                {attendance?.student?.fullname[0]}
                              </Avatar>
                              {attendance?.student?.fullname}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                            {attendance?.session?.course?.name}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                            {formatBirthdate(attendance?.session?.session_date)}
                          </TableCell>

                          <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                            {formaedTime(attendance?.session?.start_time)}
                          </TableCell>

                          <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                            {formaedTime(attendance?.session?.end_time)}
                          </TableCell>

                          <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                            <Chip
                              label={statusChip.label}
                              color={statusChip.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                            {attendance?.student?.club ? (
                              <Box display="flex" alignItems="center">
                                <Chip
                                  label={attendance?.student?.club?.name}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              </Box>
                            ) : (
                              <Chip
                                label="Aucun Club"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{ fontSize: { xs: 8, md: 16 } }}
                      >
                        Votre listes est vide
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {pagination.lastPage > 1 && (
              <Pagination
                count={pagination.lastPage}
                page={pagination.currentPage}
                onChange={(e, value) => getAtt(value)}
                color="primary"
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default AttendanceIndex;
