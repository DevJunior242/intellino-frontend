import React, { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Avatar,
  Divider,
  Button,
  CardActions,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Instance } from "../../../../Api/Axios";

const MySwiperComp = ({ onSelect, selectedId }) => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get("/api/competitions/competitions");
      setCompetitions(response.data.competitions || []);
    } catch (error) {
      console.error("Erreur Swiper:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        gutterBottom
        color="text.secondary"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        Sélectionnez la compétition votre competition :
      </Typography>

      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        style={{ paddingBottom: "40px" }}
      >
        {competitions.map((comp) => (
          <SwiperSlide key={comp.id}>
            <Card
              raised={selectedId === comp.id}
              onClick={() => onSelect(comp.id)}
              sx={{
                cursor: "pointer",
                borderRadius: 3,
                transition: "all 0.3s ease",
                border:
                  selectedId === comp.id
                    ? "3px solid #2e7d32"
                    : "1px solid #e0e0e0",
                bgcolor: selectedId === comp.id ? "#4caf50" : "#1a1a1a",
                transform: selectedId === comp.id ? "scale(1.02)" : "none",
                "&:hover": { boxShadow: 10 },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor:
                        selectedId === comp.id
                          ? "success.main"
                          : "primary.main",
                    }}
                  >
                    <EmojiEventsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {comp.nom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {comp.id.substr(0, 8)}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">{comp.lieu}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">{comp.date_debut}</Typography>
                  </Stack>
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                {selectedId === comp.id ? (
                  <Button
                    startIcon={<CheckCircleIcon />}
                    color="success"
                    variant="contained"
                    size="small"
                  >
                    Compétition Active
                  </Button>
                ) : (
                  <Button variant="outlined" size="small">
                    Gérer la compétition
                  </Button>
                )}
              </CardActions>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default MySwiperComp;
