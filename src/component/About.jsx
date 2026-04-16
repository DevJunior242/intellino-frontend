import { Box, Typography, Grid, Paper } from "@mui/material";
import {
  Favorite,
  Groups,
  EmojiObjects,
  ThumbUp,
  Star,
  Handshake,
  Person,
} from "@mui/icons-material";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import { motion } from "framer-motion";
import Mission from "./Mission";

function About() {
  const valeurs = [
    {
      id: 1,
      icon: (
        <AccessibilityIcon sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
      ),
      title: "Admins & clubs",
      desc: "gérer les élèves, sessions, abonnements et statistiques facilement..",
    },
    {
      id: 2,
      icon: (
        <PeopleOutlineOutlinedIcon
          sx={{ fontSize: 50, color: "#fbc02d", mb: 1 }}
        />
      ),
      title: "Parents",
      desc: "suivre en temps réel la présence et les progrès de leurs enfants.",
    },
    {
      id: 3,
      icon: <Groups sx={{ fontSize: 50, color: "#43a047", mb: 1 }} />,
      title: "Instructeur",
      desc: "organiser les sessions et suivre les performances de manière intuitive..",
    },
  ];
  return (
    <Box sx={{ mt: 10, mb: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            fontSize: { xs: 14, md: 32 },
            mt: 4,
          }}
        >
          À propos de Intellino
        </Typography>
        <Typography
          variant="h6"
          component="p"
          gutterBottom
          sx={{
            textAlign: "center",
            color: "text.secondary",
            mb: 6,
            fontSize: { xs: 16, md: 24 },
          }}
        >
          Simplifiez la gestion des clubs, élèves et parents avec une plateforme
          moderne, sécurisée et intuitive.
        </Typography>
      </motion.div>

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          ml: 10,
          mt: 1,
          mb: 2,
          fontSize: { xs: 16, md: 24 },
          textAlign: "center",
        }}
      >
        Pour qui ?
      </Typography>
      <Grid container spacing={2}>
        {valeurs.map((valeur, index) => (
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
            key={valeur.id}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "background.default",
                borderRadius: 2,
              }}
              data-aos="zoom-in"
              data-aos-delay={index * 200}
            >
              {valeur.icon}
              <Typography variant="h6" sx={{ mb: 2 }}>
                {valeur.title}
              </Typography>
              <Typography>{valeur.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box>
        <Mission />
      </Box>
    </Box>
  );
}

export default About;
