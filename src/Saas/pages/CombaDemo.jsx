import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  Box,
  LinearProgress,
  Stack,
} from "@mui/material";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import ScaleIcon from "@mui/icons-material/Scale";

const CombatDemo = () => {
  const [scoreAka, setScoreAka] = useState(0);
  const [scoreAo, setScoreAo] = useState(0);

  // Simulation d'un match de la catégorie "Senior -75kg"
  const matchInfo = {
    categorie: "Senior Masculin",
    poidsMax: 75,
    aka: { nom: "Sawadogo Y.", club: "AS Douanes", poids: 74.2 },
    ao: { nom: "Ouédraogo I.", club: "Sifca Karaté", poids: 73.8 },
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 800,
        mx: "auto",
        bgcolor: "#f5f5f5",
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        Gestion du Combat - Ligue de Karaté
      </Typography>

      {/* Infos Catégorie */}
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
        <Chip label={matchInfo.categorie} color="primary" />
        <Chip
          icon={<ScaleIcon />}
          label={`Limite: ${matchInfo.poidsMax}kg`}
          variant="outlined"
        />
        <Chip label="Match en cours" color="success" variant="filled" />
      </Stack>

      <Grid container spacing={2} alignItems="center">
        {/* Combattant AKA (Rouge) */}
        <Grid item xs={5}>
          <Card sx={{ borderLeft: "10px solid #d32f2f", textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">{matchInfo.aka.nom}</Typography>
              <Typography variant="caption" color="text.secondary">
                {matchInfo.aka.club}
              </Typography>
              <Typography
                variant="h2"
                sx={{ my: 2, color: "#d32f2f", fontWeight: "bold" }}
              >
                {scoreAka}
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setScoreAka(scoreAka + 1)}
                >
                  +1 Yuko
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setScoreAka(scoreAka + 3)}
                >
                  +3 Ippon
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* VS Central */}
        <Grid item xs={2} sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: "light", color: "#666" }}>
            VS
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">03:00</Typography>
        </Grid>

        {/* Combattant AO (Bleu) */}
        <Grid item xs={5}>
          <Card sx={{ borderRight: "10px solid #1976d2", textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">{matchInfo.ao.nom}</Typography>
              <Typography variant="caption" color="text.secondary">
                {matchInfo.ao.club}
              </Typography>
              <Typography
                variant="h2"
                sx={{ my: 2, color: "#1976d2", fontWeight: "bold" }}
              >
                {scoreAo}
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setScoreAo(scoreAo + 1)}
                >
                  +1 Yuko
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setScoreAo(scoreAo + 3)}
                >
                  +3 Ippon
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer Pesée / Validation */}
      <Box
        sx={{ mt: 4, p: 2, bgcolor: "white", borderRadius: 1, boxShadow: 1 }}
      >
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Vérification Officielle de la Ligue :
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">
              Poids AKA : <strong>{matchInfo.aka.poids}kg</strong> (Validé ✅)
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              Poids AO : <strong>{matchInfo.ao.poids}kg</strong> (Validé ✅)
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CombatDemo;
