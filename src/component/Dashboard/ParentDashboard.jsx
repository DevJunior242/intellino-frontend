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
} from "@mui/material";
import {
  Groups,
  School,
  PeopleAlt,
  Person,
  MonetizationOn,
  Star,
} from "@mui/icons-material";
import StartCard from "./StatCard";
import { useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import ParentMatch from "./ParentMatch";
import ParentResult from "./ParentResult";
import Grade from "./Grade";
import { UseAuth } from "../../Api/AuthContext";
import StudentsGradesOverview from "../../Saas/pages/StudentsGradesOverview";
import { blue, green, red } from "@mui/material/colors";
import ParentDet from "../../Saas/pages/ParentDet";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";

function ParentDashboard() {
  const { activeClubId } = UseAuth();
  const [stats, setStats] = useState({
    total_students: 0,
    actif_students: 0,
    inactive_students: 0,
    students: [],
  });
  const [loading, setLoading] = useState(false);
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await Instance.get(
        `/api/dashboard/stats?club_id=${activeClubId}`,
      );
      console.log(response);
      setStats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case "actif":
        return { color: "success", label: "Actif" };
      case "inactif":
        return { color: "error", label: "Inactif" };
      default:
        return { color: "default", label: status };
    }
  };
  const formatBirthdate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Grid
        container
        spacing={3}
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
          mx: "auto",
          borderRadius: 2,
          p: 2,
          pb: 20,
        }}
        minHeight={50}
      >
        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="Élèves"
            value={stats.total_students}
            icon={<School />}
            color={blue}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="enfant actif"
            value={stats.actif_students}
            icon={<School />}
            color={green}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StartCard
            title="enfant inactif"
            value={stats.inactive_students}
            icon={<School />}
            color={red}
          />
        </Grid>
      </Grid>
      <Box sx={{ height: "100vh", mt: { xs: 50, md: 4 } }}>
        <Paper
          elevation={3}
          sx={{ px: 2, backgroundColor: "background.default" }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mb: 2, textAlign: "center", fontSize: { xs: 12, md: 24 } }}
          >
            Liste de mes Enfants
          </Typography>

          {loading ? (
            <ConfigSkeleton />
          ) : (
            <TableContainer
              sx={{
                overflowX: "auto",
                width: "100%",
              }}
            >
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      Nom Complet
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      Sexe
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      Date de Naissance
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      Statut
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      Club
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.students.length > 0 ? (
                    stats.students.map((student) => {
                      const statusChip = getStatusColor(student.status);
                      return (
                        <TableRow hover key={student.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                alt={student.fullname}
                                src={student.photo}
                                sx={{
                                  mr: 2,
                                  bgcolor:
                                    student.sex === "M"
                                      ? "primary.light"
                                      : "secondary.light",
                                }}
                              >
                                {student.fullname[0]}
                              </Avatar>
                              {student.fullname}
                            </Box>
                          </TableCell>
                          <TableCell>{student.sex}</TableCell>
                          <TableCell>
                            {formatBirthdate(student.birthdate)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusChip.label}
                              color={statusChip.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {student.club ? (
                              <Box display="flex" alignItems="center">
                                <Avatar
                                  alt={student.club.name}
                                  src={student.club.logo}
                                  sx={{ mr: 1, width: 24, height: 24 }}
                                />
                                {student.club.name}
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
                      <TableCell colSpan={5} align="center">
                        Vous n'avez aucun enfant enregistré.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      <Box sx={{ mt: 3 }}>
        {/* <Grade /> */}
        <StudentsGradesOverview />
      </Box>
    </Box>
  );
}

export default ParentDashboard;
