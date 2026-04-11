import { Box, Typography, Grid, Paper } from "@mui/material";
import {
  Favorite,
  Groups,
  EmojiObjects,
  ThumbUp,
  Star,
  Handshake,
} from "@mui/icons-material";

function Valeur() {
  const valeurs = [
    {
      id: 1,
      icon: <Handshake sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />,
      title: "Confiance",
      desc: "Nous bâtissons des relations durables basées sur la transparence et le respect mutuel.",
    },
    {
      id: 2,
      icon: <EmojiObjects sx={{ fontSize: 50, color: "#fbc02d", mb: 1 }} />,
      title: "Innovation",
      desc: "Nous innovons constamment pour offrir des solutions adaptées aux besoins de nos clients.",
    },
    {
      id: 3,
      icon: <Groups sx={{ fontSize: 50, color: "#43a047", mb: 1 }} />,
      title: "Esprit d’équipe",
      desc: "Nos réussites reposent sur la collaboration et la cohésion de nos équipes.",
    },
    {
      id: 4,
      icon: <Favorite sx={{ fontSize: 50, color: "#e53935", mb: 1 }} />,
      title: "Passion",
      desc: "Nous aimons ce que nous faisons et mettons du cœur dans chaque projet.",
    },
  ];
  return (
    <Box>
      <Typography variant="h4" sx={{ mt: 10, mb: 5 }}>
        Nos Valeurs
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
    </Box>
  );
}

export default Valeur;
