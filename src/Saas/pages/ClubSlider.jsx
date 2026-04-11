import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Stack,
  Container,
  IconButton,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import GroupsIcon from "@mui/icons-material/Groups";

import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { motion } from "framer-motion";

import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

import AOS from "aos";
import "aos/dist/aos.css";
import { Instance } from "../../Api/Axios";

export default function ClubsSlider() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);
  const getClubs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Instance.get("/api/clubs");
      console.log(response);
      setClubs(response.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getClubs();
  }, [getClubs]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  //like club

  const handleLike = async (clubId) => {
    try {
      const response = await Instance.post(`/api/likes/${clubId}/store`);
      console.log(response);
      if (response?.data?.success) {
        setClubs((prevClubs) =>
          prevClubs.map((club) =>
            club.id === clubId
              ? {
                  ...club,
                  is_liked: !club.is_liked,
                  likes_count: response.data.likes_count,
                }
              : club,
          ),
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des attendances :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          mb={6}
          data-aos="fade-up"
        >
          Rejoignez vos clubs préférés
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{
                width: 40,
                height: 40,
                border: "4px solid #1976d2",
                borderTop: "4px solid transparent",
                borderRadius: "50%",
              }}
            />
          </Box>
        ) : clubs.length > 0 ? (
          <Box sx={{ position: "relative", px: { xs: 2, md: 6 } }}>
            {/* Box parent relatif pour positionner les flèches sur les côtés */}

            <Swiper
              modules={[Autoplay, Navigation]}
              navigation={true}
              centeredSlides={false}
              grabCursor={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              spaceBetween={30}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              style={{
                padding: "20px 0",
              }}
            >
              {clubs.map((club, index) => (
                <SwiperSlide
                  key={club.id}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    height: "auto",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    data-aos="zoom-in"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Card
                      sx={{
                        maxWidth: 320,
                        width: "100%",
                        borderRadius: 3,
                        boxShadow: 3,
                        position: "relative",
                      }}
                    >
                      {/* Bouton Like flottant sur l'image */}
                      <IconButton
                        onClick={() => handleLike(club.id)}
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": { backgroundColor: "#fff" },
                          zIndex: 2,
                        }}
                      >
                        <FavoriteIcon
                          sx={{
                            color: club.is_liked ? "#f44336" : "#ccc",
                            fontSize: 20,
                          }}
                        />
                      </IconButton>

                      <CardMedia
                        component="img"
                        height="160"
                        image={club.logo ?? "/club-default.png"}
                        alt={club.name}
                      />

                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {club.name}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          mt={1}
                          alignItems="center"
                        >
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {club.city}, {club.country}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          mt={1}
                          alignItems="center"
                        >
                          <SportsMartialArtsIcon
                            fontSize="small"
                            color="action"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {club.discipline?.name}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          mt={1}
                          alignItems="center"
                        >
                          <GroupsIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {club.users_count} membres
                          </Typography>
                        </Stack>

                        {/* Section Stats : Vues et Likes */}
                        <Stack
                          direction="row"
                          spacing={2}
                          mt={2}
                          pt={1}
                          sx={{ borderTop: "1px solid #eee" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <VisibilityIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography variant="caption" fontWeight="bold">
                              {club.views_count || 0}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <FavoriteIcon
                              sx={{ fontSize: 16, color: "#f44336" }}
                            />
                            <Typography variant="caption" fontWeight="bold">
                              {club.likes_count || 0}
                            </Typography>
                          </Box>
                        </Stack>

                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2, borderRadius: 2, textTransform: "none" }}
                        >
                          S'inscrire
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
