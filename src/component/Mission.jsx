import { Box, Typography, Grid, Paper } from "@mui/material";
import {
  Favorite,
  Groups,
  EmojiObjects,
  ThumbUp,
  Star,
  Handshake,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import LockIcon from '@mui/icons-material/Lock';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import DashboardIcon from '@mui/icons-material/Dashboard';
function Mission() {
  const valeurs = [
    {
      id: 1,
      icon: <LockIcon sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />,
      desc: "Offrir une expérience simple, sécurisée et transparente pour tous les utilisateurs.",
    },
    {
      id: 2,
      icon: <SettingsApplicationsIcon sx={{ fontSize: 50, color: "#fbc02d", mb: 1 }} />,
      desc: "  Automatiser les tâches de suivi et de reporting afin que  chaque club puisse se concentrer sur l’enseignement et le développement des élèves.",
    },
    {
      id: 3,
      icon: <DashboardIcon sx={{ fontSize: 50, color: "#43a047", mb: 1 }} />,
      desc: "  Interface intuitive, dashboard complet, gestion sécurisée des  données et multi-club.",
    },
  ];
  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", ml:10, mt:1, mb: 2, fontSize: { xs: 14, md: 32 },textAlign:'center' }}
        >
          Notre mission
        </Typography>
      </motion.div>

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

              <Typography>{valeur.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Mission;
