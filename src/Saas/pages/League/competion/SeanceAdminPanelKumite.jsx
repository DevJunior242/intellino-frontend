import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  Alert,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import { Instance } from "../../../../Api/Axios";
import ArbitresKumitePanel from "./ArbitresKumitePanel";

const SeanceAdminPanelKumite = ({
  config,
  data,
  handleValider,
  handleDesignerSuperviseur,
  onRefresh,
  success,
  errors,
}) => {
  const isValidee = config?.est_valide;
  const currentCombat = data?.current_combat;
  const athleteAka = currentCombat?.athlete_aka;
  const athleteAo = currentCombat?.athlete_ao;

  const [arbitresDispos, setArbitresDispos] = useState([]);
  const { enCours, arbitres, superviseur } = data;

  return (
    <Box
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Erreurs / succès */}
      {success[config.id] && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {success[config.id]}
        </Alert>
      )}
      {errors[config.id]?.length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {errors?.[config.id] &&
            (Array.isArray(errors[config.id]) ? (
              errors[config.id].map((err, index) => <p key={index}>{err}</p>)
            ) : (
              <p>{errors[config.id]}</p>
            ))}
        </Alert>
      )}

      {/* --- HEADER : INFO PLATEAU --- */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          {config.evenement_nom} - {config.plateau_nom}
        </Typography>
        {!isValidee && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => handleValider(config?.id)}
          >
            Valider la Configuration
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* --- SECTION 1 : ATHLÈTES EN COURS (SI VALIDÉE) --- */}
        {isValidee && currentCombat ? (
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Chip
                    icon={<TimerIcon />}
                    label="03:00"
                    color="secondary"
                    variant="outlined"
                  />
                  <Typography variant="h6" color="textSecondary">
                    {currentCombat.etape}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-around"
                  alignItems="center"
                >
                  {/* AKA (ROUGE) */}
                  <Box textAlign="center">
                    <Avatar
                      sx={{ width: 80, height: 80, bgcolor: "red", mb: 1 }}
                    >
                      {athleteAka?.nom?.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {athleteAka?.nom}
                    </Typography>
                    <Typography variant="h2" color="error">
                      {currentCombat.score_aka || 0}
                    </Typography>
                    <Box mt={1}>
                      <Typography variant="caption">Pénalités C1/C2</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={20}
                        color="error"
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="h4">VS</Typography>

                  {/* AO (BLEU) */}
                  <Box textAlign="center">
                    <Avatar
                      sx={{ width: 80, height: 80, bgcolor: "blue", mb: 1 }}
                    >
                      {athleteAo?.nom?.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {athleteAo?.nom}
                    </Typography>
                    <Typography variant="h2" color="primary">
                      {currentCombat.score_ao || 0}
                    </Typography>
                    <Box mt={1}>
                      <Typography variant="caption">Pénalités C1/C2</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={40}
                        color="primary"
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 5, textAlign: "center", border: "2px dashed #ccc" }}>
              <Typography variant="h6" color="textSecondary">
                En attente de validation ou de lancement du premier combat...
              </Typography>
            </Card>
          </Grid>
        )}
        {/* --- SECTION 2 : DÉSIGNATION (4 JUGES + 1 CENTRAL + 1 KANSA) --- */}
        <Grid item xs={12} md={4}>
          <ArbitresKumitePanel
            config={config}
            arbitres={arbitres}
            handleDesignerSuperviseur={handleDesignerSuperviseur}
            arbitresDispos={arbitresDispos}
            onRefresh={onRefresh}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SeanceAdminPanelKumite;
