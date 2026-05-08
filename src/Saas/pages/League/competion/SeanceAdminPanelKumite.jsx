// import React, { useState } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   Button,
//   Card,
//   CardContent,
//   Avatar,
//   Divider,
//   Chip,
//   LinearProgress,
//   Alert,
// } from "@mui/material";
// import TimerIcon from "@mui/icons-material/Timer";
// import GavelIcon from "@mui/icons-material/Gavel";
// import PersonIcon from "@mui/icons-material/Person";
// import { Instance } from "../../../../Api/Axios";
// import ArbitresKumitePanel from "./ArbitresKumitePanel";

// const SeanceAdminPanelKumite = ({
//   config,
//   data,
//   handleValider,
//   handleDesignerSuperviseur,
//   onRefresh,
//   success,
//   errors,
// }) => {
//   const isValidee = config?.est_valide;
//   const currentCombat = data?.current_combat;
//   const athleteAka = currentCombat?.athlete_aka;
//   const athleteAo = currentCombat?.athlete_ao;

//   const [arbitresDispos, setArbitresDispos] = useState([]);
//   const { enCours, arbitres, superviseur } = data;

//   return (
//     <Box
//       sx={{
//         p: 3,
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         overflowY: "auto",
//       }}
//     >
//       {/* Erreurs / succès */}
//       {success[config.id] && (
//         <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
//           {success[config.id]}
//         </Alert>
//       )}
//       {errors[config.id]?.length > 0 && (
//         <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
//           {errors?.[config.id] &&
//             (Array.isArray(errors[config.id]) ? (
//               errors[config.id].map((err, index) => <p key={index}>{err}</p>)
//             ) : (
//               <p>{errors[config.id]}</p>
//             ))}
//         </Alert>
//       )}

//       {/* --- HEADER : INFO PLATEAU --- */}
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={3}
//       >
//         <Typography variant="h4" fontWeight="bold">
//           {config.evenement_nom} - {config.plateau_nom}
//         </Typography>
//         {!isValidee && (
//           <Button
//             variant="contained"
//             color="primary"
//             size="large"
//             onClick={() => handleValider(config?.id)}
//           >
//             Valider la Configuration
//           </Button>
//         )}
//       </Box>

//       <Grid container spacing={3}>
//         {/* --- SECTION 1 : ATHLÈTES EN COURS (SI VALIDÉE) --- */}
//         {isValidee && currentCombat ? (
//           <Grid item xs={12} md={8}>
//             <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
//               <CardContent>
//                 <Box
//                   display="flex"
//                   justifyContent="space-between"
//                   alignItems="center"
//                   mb={2}
//                 >
//                   <Chip
//                     icon={<TimerIcon />}
//                     label="03:00"
//                     color="secondary"
//                     variant="outlined"
//                   />
//                   <Typography variant="h6" color="textSecondary">
//                     {currentCombat.etape}
//                   </Typography>
//                 </Box>

//                 <Box
//                   display="flex"
//                   justifyContent="space-around"
//                   alignItems="center"
//                 >
//                   {/* AKA (ROUGE) */}
//                   <Box textAlign="center">
//                     <Avatar
//                       sx={{ width: 80, height: 80, bgcolor: "red", mb: 1 }}
//                     >
//                       {athleteAka?.nom?.charAt(0)}
//                     </Avatar>
//                     <Typography variant="h5" fontWeight="bold">
//                       {athleteAka?.nom}
//                     </Typography>
//                     <Typography variant="h2" color="error">
//                       {currentCombat.score_aka || 0}
//                     </Typography>
//                     <Box mt={1}>
//                       <Typography variant="caption">Pénalités C1/C2</Typography>
//                       <LinearProgress
//                         variant="determinate"
//                         value={20}
//                         color="error"
//                         sx={{ height: 10, borderRadius: 5 }}
//                       />
//                     </Box>
//                   </Box>

//                   <Typography variant="h4">VS</Typography>

//                   {/* AO (BLEU) */}
//                   <Box textAlign="center">
//                     <Avatar
//                       sx={{ width: 80, height: 80, bgcolor: "blue", mb: 1 }}
//                     >
//                       {athleteAo?.nom?.charAt(0)}
//                     </Avatar>
//                     <Typography variant="h5" fontWeight="bold">
//                       {athleteAo?.nom}
//                     </Typography>
//                     <Typography variant="h2" color="primary">
//                       {currentCombat.score_ao || 0}
//                     </Typography>
//                     <Box mt={1}>
//                       <Typography variant="caption">Pénalités C1/C2</Typography>
//                       <LinearProgress
//                         variant="determinate"
//                         value={40}
//                         color="primary"
//                         sx={{ height: 10, borderRadius: 5 }}
//                       />
//                     </Box>
//                   </Box>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ) : (
//           <Grid item xs={12} md={8}>
//             <Card sx={{ p: 5, textAlign: "center", border: "2px dashed #ccc" }}>
//               <Typography variant="h6" color="textSecondary">
//                 En attente de validation ou de lancement du premier combat...
//               </Typography>
//             </Card>
//           </Grid>
//         )}
//         {/* --- SECTION 2 : DÉSIGNATION (4 JUGES + 1 CENTRAL + 1 KANSA) --- */}
//         <Grid item xs={12} md={4}>
//           <ArbitresKumitePanel
//             config={config}
//             arbitres={arbitres}
//             handleDesignerSuperviseur={handleDesignerSuperviseur}
//             arbitresDispos={arbitresDispos}
//             onRefresh={onRefresh}
//           />
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default SeanceAdminPanelKumite;

// ─── SeanceAdminPanelKumite.jsx ───────────────────────────────────────────────
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Stack,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
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
  submitId,
}) => {
  const isValidee = config?.est_valide;
  const currentCombat = data?.current_combat;
  const athleteAka = currentCombat?.athlete_aka;
  const athleteAo = currentCombat?.athlete_ao;
  const { arbitres, superviseur } = data;

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#1e2433", borderRadius: 2 },
      }}
    >
      {/* Messages */}
      {success[config.id] && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success[config.id]}
          </Alert>
        </Fade>
      )}
      {errors[config.id]?.length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {Array.isArray(errors[config.id]) ? (
            errors[config.id].map((err, i) => (
              <p key={i} style={{ margin: 0 }}>
                {err}
              </p>
            ))
          ) : (
            <p style={{ margin: 0 }}>{errors[config.id]}</p>
          )}
        </Alert>
      )}

      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        gap={1.5}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="white"
            sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
          >
            {config.evenement_nom}
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b90a0" }}>
            {config.plateau_nom}
          </Typography>
        </Box>
        {!isValidee && (
          <Button
            variant="contained"
            color="primary"
            disabled={submitId === config.id}
            onClick={() => handleValider(config?.id)}
            sx={{ borderRadius: 3, fontWeight: "bold", flexShrink: 0 }}
          >
            {submitId === config.id ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={16} color="inherit" />
                <span>Validation...</span>
              </Stack>
            ) : (
              "Valider la configuration"
            )}
          </Button>
        )}
      </Stack>

      <Grid container spacing={2}>
        {/* Zone combat */}
        <Grid item xs={12} md={8}>
          {isValidee && currentCombat ? (
            <Fade in timeout={400}>
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: "#0e1118",
                  border: "1px solid #1e2433",
                }}
                elevation={0}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  {/* Timer + étape */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Chip
                      icon={<TimerIcon sx={{ fontSize: 16 }} />}
                      label="03:00"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                    <Typography variant="body2" sx={{ color: "#8b90a0" }}>
                      {currentCombat.etape}
                    </Typography>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#22c55e",
                        animation: "pulse 1.5s ease-in-out infinite",
                        "@keyframes pulse": {
                          "0%,100%": { opacity: 1 },
                          "50%": { opacity: 0.3 },
                        },
                      }}
                    />
                  </Stack>

                  {/* Athlètes */}
                  <Stack
                    direction="row"
                    justifyContent="space-around"
                    alignItems="center"
                    gap={2}
                  >
                    {/* AKA */}
                    <Box textAlign="center" sx={{ flex: 1 }}>
                      <Avatar
                        sx={{
                          width: { xs: 56, sm: 80 },
                          height: { xs: 56, sm: 80 },
                          bgcolor: "#dc2626",
                          mb: 1,
                          mx: "auto",
                          border: "3px solid #ef4444",
                          fontSize: { xs: "1.2rem", sm: "1.8rem" },
                        }}
                      >
                        {athleteAka?.nom?.charAt(0)}
                      </Avatar>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="white"
                        noWrap
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.9rem" } }}
                      >
                        {athleteAka?.nom}
                      </Typography>
                      <Chip
                        label="AKA"
                        size="small"
                        sx={{
                          bgcolor: "#dc262620",
                          color: "#ef4444",
                          fontWeight: 700,
                          height: 18,
                          fontSize: "0.6rem",
                          mb: 1,
                        }}
                      />
                      <Typography
                        variant="h3"
                        sx={{
                          color: "#ef4444",
                          fontWeight: 900,
                          lineHeight: 1,
                          fontSize: { xs: "2rem", sm: "3rem" },
                        }}
                      >
                        {currentCombat.score_aka || 0}
                      </Typography>
                      <Box mt={1}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#636b88", fontSize: "0.6rem" }}
                        >
                          Pénalités C1/C2
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={20}
                          color="error"
                          sx={{
                            height: 6,
                            borderRadius: 5,
                            mt: 0.5,
                            bgcolor: "#1e2433",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* VS */}
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "#636b88",
                          fontWeight: 900,
                          fontSize: { xs: "1rem", sm: "1.5rem" },
                        }}
                      >
                        VS
                      </Typography>
                    </Box>

                    {/* AO */}
                    <Box textAlign="center" sx={{ flex: 1 }}>
                      <Avatar
                        sx={{
                          width: { xs: 56, sm: 80 },
                          height: { xs: 56, sm: 80 },
                          bgcolor: "#1d4ed8",
                          mb: 1,
                          mx: "auto",
                          border: "3px solid #3b82f6",
                          fontSize: { xs: "1.2rem", sm: "1.8rem" },
                        }}
                      >
                        {athleteAo?.nom?.charAt(0)}
                      </Avatar>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="white"
                        noWrap
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.9rem" } }}
                      >
                        {athleteAo?.nom}
                      </Typography>
                      <Chip
                        label="AO"
                        size="small"
                        sx={{
                          bgcolor: "#1d4ed820",
                          color: "#3b82f6",
                          fontWeight: 700,
                          height: 18,
                          fontSize: "0.6rem",
                          mb: 1,
                        }}
                      />
                      <Typography
                        variant="h3"
                        sx={{
                          color: "#3b82f6",
                          fontWeight: 900,
                          lineHeight: 1,
                          fontSize: { xs: "2rem", sm: "3rem" },
                        }}
                      >
                        {currentCombat.score_ao || 0}
                      </Typography>
                      <Box mt={1}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#636b88", fontSize: "0.6rem" }}
                        >
                          Pénalités C1/C2
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={40}
                          color="primary"
                          sx={{
                            height: 6,
                            borderRadius: 5,
                            mt: 0.5,
                            bgcolor: "#1e2433",
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          ) : (
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                textAlign: "center",
                border: "2px dashed #1e2433",
                borderRadius: 4,
                bgcolor: "#0e1118",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#141720",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <TimerIcon sx={{ color: "#636b88" }} />
              </Box>
              <Typography variant="body1" sx={{ color: "#636b88" }}>
                {!isValidee
                  ? "Configuration non validée"
                  : "En attente du premier combat..."}
              </Typography>
              {!isValidee && (
                <Typography
                  variant="caption"
                  sx={{ color: "#3b82f6", display: "block", mt: 1 }}
                >
                  Validez la configuration ci-dessus pour commencer
                </Typography>
              )}
            </Card>
          )}
        </Grid>

        {/* Panel arbitres */}
        <Grid item xs={12} md={4}>
          <ArbitresKumitePanel
            config={config}
            arbitres={arbitres}
            handleDesignerSuperviseur={handleDesignerSuperviseur}
            onRefresh={onRefresh}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SeanceAdminPanelKumite;
