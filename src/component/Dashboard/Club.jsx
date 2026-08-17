import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Pagination,
  Avatar,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Chip from "@mui/material/Chip";
import PulseLoader from "react-spinners/PulseLoader";
import { motion } from "framer-motion";
import { Instance } from "../../Api/Axios";

function Club() {
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const getClub = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await Instance(`/api/clubs?page=${page}`);
      console.log(response);
      const club = response.data.clubs || [];
      const clubArray = club.data ? club.data : club;
      setPagination({
        currentPage: club.current_page,
        lastPage: club.last_page,
        perPage: club.per_page,
        total: club.total,
      });
      setClubs(clubArray);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getClub();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <PulseLoader />
      </Box>
    );
  }
  return (
    <Box sx={{ py: 10, px: 2 }}>
      <Typography variant="h4" textAlign="center" sx={{ mb: 6 }}>
        Liste des clubs
      </Typography>
      <Grid container spacing={2} sx={{ pb: 2 }}>
        {clubs.map((club, index) => (
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
            key={club.id}
          >
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.06 }}
              elevation={3}
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "background.default",
              }}
            >
              {club.logo && (
                <Avatar src={club.logo} sx={{ width: 100, height: 100 }} />
              )}
              <Typography variant="h6" sx={{ mb: 2 }}>
                {club.name}
              </Typography>
              <Typography
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <LocationOnIcon fontSize="small" /> {club.city}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {club.discipline}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {club.students.length} élèves
              </Typography>
              Abbonnement:
              <Chip
                label={
                  <Typography>
                    {club.subscriptions?.[0]?.status ?? "Aucun"}
                  </Typography>
                }
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          count={pagination.lastPage}
          page={pagination.currentPage}
          onChange={(e, value) => getClub(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
}

export default Club;
