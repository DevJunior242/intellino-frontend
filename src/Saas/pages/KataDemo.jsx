import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function KataScoringForm({ athlete, onSave }) {
  // Initialisation des 7 notes à 7.0 par défaut
  const [notes, setNotes] = useState([7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0]);
  const [activeJuge, setActiveJuge] = useState(0);

  const handleAdjust = (idx, amount) => {
    const newNotes = [...notes];
    // On limite entre 5.0 et 10.0 (Standard WKF)
    newNotes[idx] = Math.min(10, Math.max(5, newNotes[idx] + amount));
    setNotes(newNotes);
    setActiveJuge(idx);
  };

  // Calcul intelligent des notes conservées
  const processed = useMemo(() => {
    const indexed = notes.map((val, i) => ({ val, i }));
    const sorted = [...indexed].sort((a, b) => a.val - b.val);

    return {
      low: [sorted[0].i, sorted[1].i],
      high: [sorted[5].i, sorted[6].i],
      scoreFinal: sorted
        .slice(2, 5)
        .reduce((a, b) => a + b.val, 0)
        .toFixed(2),
    };
  }, [notes]);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      {/* --- EN-TÊTE ATHLÈTE --- */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "#1a237e",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              Passage en cours
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {athlete?.nom || "COULIBALY Moussa"}
            </Typography>
            <Typography variant="subtitle1">
              {athlete?.club || "Dragon Blanc"} — {athlete?.kata || "Kanku Dai"}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h2" sx={{ fontWeight: 900, color: "#ffd700" }}>
              {processed.scoreFinal}
            </Typography>
            <Typography variant="caption">SCORE TOTAL (WKF)</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* --- GRILLE DE SAISIE DES JUGES --- */}
      <Grid container spacing={2}>
        {notes.map((note, idx) => {
          const isLow = processed.low.includes(idx);
          const isHigh = processed.high.includes(idx);
          const isSelected = activeJuge === idx;

          return (
            <Grid item xs={12} sm={6} md={4} lg={1.7} key={idx}>
              <Paper
                onClick={() => setActiveJuge(idx)}
                sx={{
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid #3f51b5"
                    : "1px solid #e0e0e0",
                  bgcolor: isLow || isHigh ? "#f5f5f5" : "white",
                  transition: "0.2s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  JUGE {idx + 1}
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    my: 1,
                    fontWeight: 700,
                    textDecoration: isLow || isHigh ? "line-through" : "none",
                    color: isLow
                      ? "error.main"
                      : isHigh
                        ? "success.main"
                        : "text.primary",
                    opacity: isLow || isHigh ? 0.4 : 1,
                  }}
                >
                  {note.toFixed(1)}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="center">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdjust(idx, -0.1);
                    }}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdjust(idx, 0.1);
                    }}
                    color="success"
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* --- BOUTONS DE CONTRÔLE RAPIDE --- */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: "#f8f9fa",
          borderRadius: 3,
          border: "1px dashed #ccc",
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Ajustement rapide pour Juge {activeJuge + 1}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {[7.0, 7.5, 8.0, 8.5, 9.0].map((val) => (
            <Button
              key={val}
              variant="outlined"
              onClick={() => handleAdjust(activeJuge, val - notes[activeJuge])}
              sx={{ m: 0.5 }}
            >
              Set {val.toFixed(1)}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* --- VALIDATION FINALE --- */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<CheckCircleIcon />}
        sx={{
          mt: 4,
          py: 2,
          fontSize: "1.2rem",
          fontWeight: "bold",
          borderRadius: 10,
        }}
        onClick={() => onSave(notes, processed.scoreFinal)}
      >
        CONFIRMER ET ENREGISTRER LE SCORE
      </Button>
    </Box>
  );
}
