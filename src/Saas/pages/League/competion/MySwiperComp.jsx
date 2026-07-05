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
  Chip,
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
import { UseAuth } from "../../../../Api/AuthContext";
import ConfigSkeleton from "../../ConfigSkeleton";

const MySwiperComp = ({ onSelect, selectedId }) => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get(`/api/competitions/competitions`);
      console.log("competitions", response);
      setCompetitions(response.data.data || []);
    } catch (error) {
      console.error("Erreur Swiper:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  if (loading) return <ConfigSkeleton />;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        gutterBottom
        color="text.secondary"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        Sélectionnez la compétition votre competition
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
                    <Typography variant="caption" color="white">
                      competition {comp?.niveau?.nom}-(
                      {comp?.sub_discipline?.nom})
                    </Typography>
                    <Chip
                      label={`${comp?.category?.nom ?? ""} - ${comp?.category?.sexe ?? ""}`}
                      size="small"
                    />
                  </Box>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">
                      {comp?.evenement?.lieu}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">
                      {new Date(comp.heure_debut_prevu).toLocaleDateString(
                        "fr-FR",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}{" "}
                      {new Date(comp.heure_debut_prevu).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                      {" → "}
                      {new Date(comp.heure_fin_prevue).toLocaleDateString(
                        "fr-FR",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}{" "}
                      {new Date(comp.heure_fin_prevue).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </Typography>
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
