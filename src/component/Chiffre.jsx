import { Box, Grid, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import GroupsIcon from "@mui/icons-material/Groups";

export default function ChiffresCles() {
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  const stats = [
    { id: 1, label: "Élèves inscrits", value: "850+", icon: <GroupsIcon sx={{ fontSize: 40 }} /> },
    { id: 2, label: "Années d’expérience", value: "12", icon: <SchoolIcon sx={{ fontSize: 40 }} /> },
    { id: 3, label: "Professeurs qualifiés", value: "35+", icon: <EmojiPeopleIcon sx={{ fontSize: 40 }} /> },
    { id: 4, label: "Taux de réussite", value: "98%", icon: <WorkspacePremiumIcon sx={{ fontSize: 40 }} /> },
  ];

  return (
    <Box
      sx={{
        py: 10,
        px: 3,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
                          url('https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1470&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" sx={{ mb: 6, fontWeight: "bold" }}>
        Nos Chiffres Clés
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id} data-aos="fade-up">
            <Paper
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              sx={{
                py: 4,
                px: 2,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 3,
                boxShadow: 3,
                backdropFilter: "blur(8px)",
              }}
            >
              {stat.icon}
              <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="body1">{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
