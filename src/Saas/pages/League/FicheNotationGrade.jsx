import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Avatar,
  Slider,
  TextField,
  LinearProgress,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

// --- COULEURS DU THÈME EXACT (Dark Mode de l'image) ---
const theme = {
  bg: "#1a1d21", // Fond principal
  paper: "#212529", // Fond des grands blocs
  card: "#2c3035", // Fond des stats cards (Date, Lieu, etc.)
  textMain: "#ffffff",
  textSecondary: "#8b90a0",
  accent: "#e8c84a", // Jaune Karaté
  success: "#4caf50", // Vert
  warning: "#f44336", // Rouge
};

// --- COMPOSANT : Carte d'Info Principale ---
const InfoCard = ({ title, value, detail, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      bgcolor: theme.card,
      borderRadius: 4,
      flexGrow: 1,
      minWidth: "220px",
      border: "1px solid rgba(255,255,255,0.03)",
    }}
  >
    <Typography
      variant="body2"
      sx={{ color: theme.textSecondary, mb: 1, fontWeight: 500 }}
    >
      {title}
    </Typography>
    <Typography
      variant="h6"
      sx={{ color: color || theme.textMain, fontWeight: 700, lineHeight: 1.2 }}
    >
      {value}
    </Typography>
    {detail && (
      <Typography
        variant="caption"
        sx={{ color: theme.textSecondary, display: "block", mt: 0.5 }}
      >
        {detail}
      </Typography>
    )}
  </Paper>
);

// --- COMPOSANT : Curseurs de Notation (Grade Sliders) ---
const GradeSlider = ({ title, value, onChange }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      bgcolor: theme.card,
      borderRadius: 3,
      border: "1px solid rgba(255,255,255,0.03)",
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: theme.textSecondary,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 1,
        mb: 1.5,
        display: "block",
      }}
    >
      {title}
    </Typography>
    <Stack direction="row" spacing={3} alignItems="center">
      <Typography
        variant="h3"
        sx={{ color: "#2196f3", fontWeight: 800, lineHeight: 1 }}
      >
        {value.toFixed(1)}
      </Typography>
      <Slider
        value={value}
        onChange={onChange}
        min={0}
        max={10}
        step={0.1}
        valueLabelDisplay="auto"
        sx={{
          color: "#2196f3",
          height: 4,
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            backgroundColor: "#fff",
            border: "2px solid #2196f3",
            "&:hover, &.Mui-focusVisible, &.Mui-active": {
              boxShadow: "none",
            },
          },
          "& .MuiSlider-track": { border: "none" },
          "& .MuiSlider-rail": { opacity: 0.2, backgroundColor: "#1a1d21" },
          "& .MuiSlider-valueLabel": { bgcolor: "#2196f3" },
        }}
      />
    </Stack>
  </Paper>
);

// --- COMPOSANT PRINCIPAL : Page Fiche de Notation de Grade ---
export default function FicheNotationGrade() {
  const [grades, setGrades] = useState({
    kihon: 7.5,
    kata: 8.0,
    kumite: 7.0,
    esprit: 8.5,
    esthetique: 7.5,
  });

  const moyenne = (
    Object.values(grades).reduce((a, b) => a + b, 0) /
    Object.values(grades).length
  ).toFixed(2);
  const total = Object.values(grades)
    .reduce((a, b) => a + b, 0)
    .toFixed(1);
  const seuiAdmisse = 6.0;
  const isAdmisse = moyenne >= seuiAdmisse;

  const handleChange = (grade) => (event, newValue) => {
    setGrades({ ...grades, [grade]: newValue });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bg, minHeight: "100vh" }}>
      {/* --- HEADER --- */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography
          variant="h5"
          sx={{ color: theme.textMain, fontWeight: 700 }}
        >
          Fiche de notation de grade
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label="Saison 2024–2025"
            sx={{
              bgcolor: theme.card,
              color: theme.success,
              fontWeight: 600,
              px: 1,
              borderRadius: 2,
            }}
          />
          <NotificationsNoneIcon sx={{ color: theme.textSecondary }} />
          <Avatar
            sx={{
              bgcolor: theme.accent,
              color: "#1a1d21",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            AD
          </Avatar>
        </Stack>
      </Stack>

      {/* --- BOUTONS D'ACTION SUPÉRIEURS --- */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "rgba(255,255,255,0.2)",
            textTransform: "none",
            px: 3,
            borderRadius: 2,
          }}
        >
          + Nouvelle fiche
        </Button>
        <Button
          variant="outlined"
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            color: theme.textSecondary,
            borderColor: "rgba(255,255,255,0.2)",
            textTransform: "none",
            px: 3,
            borderRadius: 2,
          }}
        >
          Toutes les sessions
        </Button>
      </Stack>

      {/* --- BLOC INFOS GÉNÉRALES --- */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 4, overflowX: "auto", pb: 1 }}
      >
        <InfoCard
          title="Candidat"
          value="Traoré Aminata"
          detail="1er Kyu → 1er Dan"
        />
        <InfoCard title="Club" value="Bushido Abidjan" />
        <InfoCard
          title="Session"
          value="21 mars 2025"
          detail="salle omnisports Abidjan"
        />
      </Stack>
      {/* --- RÉSULTAT FINAL --- */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          bgcolor: theme.paper,
          borderRadius: 4,
          mb: 4,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: theme.textSecondary, mb: 1, fontWeight: 600 }}
        >
          Résultat
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={isAdmisse ? "Admisse" : "Ajournée"}
            size="large"
            sx={{
              bgcolor: isAdmisse ? "rgba(76, 175, 80, 0.08)" : theme.warning,
              color: isAdmisse ? "#4caf50" : "#ffffff",
              fontWeight: 700,
              fontSize: "0.8rem",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: theme.textSecondary, fontWeight: 500 }}
          >
            Décernée le 21 mars 2025, par le jury technique national.
          </Typography>
        </Stack>
      </Paper>

      {/* --- ÉVALUATION TECHNIQUE (Grille de notation) --- */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          bgcolor: theme.paper,
          borderRadius: 4,
          mb: 4,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: theme.textMain, fontWeight: 600, mb: 3 }}
        >
          Évaluation technique — Grille 1er Dan
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <GradeSlider
              title="KIHON"
              value={grades.kihon}
              onChange={handleChange("kihon")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <GradeSlider
              title="KATA (HEIAN + IMPOSÉ)"
              value={grades.kata}
              onChange={handleChange("kata")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <GradeSlider
              title="KUMITE APPLICATION"
              value={grades.kumite}
              onChange={handleChange("kumite")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <GradeSlider
              title="ESPRIT & ATTITUDE"
              value={grades.esprit}
              onChange={handleChange("esprit")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <GradeSlider
              title="ESTHÉTIQUE"
              value={grades.esthetique}
              onChange={handleChange("esthetique")}
            />
          </Grid>

          {/* --- MOYENNE FINALE (Featured Card) --- */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: "rgba(33, 150, 243, 0.05)",
                borderRadius: 3,
                border: "1px solid rgba(33, 150, 243, 0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                minHeight: "120px",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#2196f3",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  mb: 1.5,
                }}
              >
                MOYENNE FINALE
              </Typography>
              <Typography
                variant="h3"
                sx={{ color: "#2196f3", fontWeight: 800, lineHeight: 1 }}
              >
                {moyenne}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#2196f3", mt: 1, fontWeight: 500 }}
              >
                Seuil : {seuiAdmisse.toFixed(1)} / 10
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* --- OBSERVATIONS DU JURY --- */}
        <Typography
          variant="subtitle2"
          sx={{ color: theme.textSecondary, mb: 1, fontWeight: 600 }}
        >
          Observations du jury
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          defaultValue="Bonnes bases techniques. Kata Bassai Dai à travailler davantage. Excellent esprit martial."
          sx={{
            bgcolor: theme.card,
            borderRadius: 3,
            mb: 4,
            "& .MuiOutlinedInput-root": {
              color: theme.textMain,
              "& fieldset": { borderColor: "rgba(255,255,255,0.03)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.08)" },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(255,255,255,0.1)",
              },
            },
          }}
        />

        {/* --- BOUTONS D'ACTION FINAUX --- */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "flex-start" }}
        >
          <Button
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.2)",
              textTransform: "none",
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Valider & signer
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: theme.textSecondary,
              borderColor: "rgba(255,255,255,0.2)",
              textTransform: "none",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                borderColor: theme.accent,
                bgcolor: "rgba(232, 200, 74, 0.05)",
              },
            }}
          >
            Imprimer PDF
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
