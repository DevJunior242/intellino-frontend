// import React, { useState } from "react";
// import {
//   Stack,
//   Typography,
//   Button,
//   List,
//   ListItem,
//   ListItemText,
//   Chip,
//   IconButton,
//   Divider,
//   Box,
//   Modal,
//   Menu,
//   MenuItem,
//   Avatar,
// } from "@mui/material";
// import {
//   PersonAdd,
//   Logout,
//   Chair,
//   AddCircle,
//   Gavel,
//   Shield,
// } from "@mui/icons-material";
// import { Instance } from "../../../../Api/Axios";

// const ArbitresKumitePanel = ({
//   config,
//   arbitres,
//   handleDesignerSuperviseur,
//   onRefresh,
// }) => {
//   const [openModal, setOpenModal] = useState(false);
//   const [arbitresDispos, setArbitresDispos] = useState([]);

//   const chargerArbitresDispos = async () => {
//     console.log("Config sélectionnée:", config);
//     console.log("arbitres", arbitres);

//     if (!config?.evenement_id) {
//       console.error("ID Événement manquant !");
//       return;
//     }
//     try {
//       const res = await Instance.get(
//         `/api/arbitres/disponibles/${config.evenement_id}/${config.id}`,
//       );
//       console.log("arbitres disponibles", res.data);
//       setArbitresDispos(res.data);
//       setOpenModal(true);
//     } catch (error) {
//       console.error("Erreur chargement arbitres", error);
//     }
//   };

//   const assignerArbitre = async (arbitreCompId) => {
//     await Instance.post(`/api/rotation-arbitres`, {
//       config_notation_id: config.id,
//       arbitre_competition_id: arbitreCompId,
//     });
//     setOpenModal(false);
//     onRefresh();
//   };

//   const [anchorEl, setAnchorEl] = useState(null);
//   const [arbitreEnCours, setArbitreEnCours] = useState(null);

//   const handleOuvrirMenuPostes = (event, arbitre) => {
//     setAnchorEl(event.currentTarget);
//     setArbitreEnCours(arbitre);
//   };

//   const handleAssignerPoste = async (rotationId, numeroPoste) => {
//     try {
//       const response = await Instance.patch(`/api/rotation-arbitres/update`, {
//         rotation_id: rotationId,
//         poste: numeroPoste,
//       });

//       if (response.data.success) {
//         onRefresh();
//       }
//     } catch (error) {
//       console.error("Erreur lors de l'assignation du poste :", error);
//       const message =
//         error.response?.data?.message || "Erreur lors de l'assignation";
//       alert(message);
//     }
//   };

//   const handleLibérerPoste = async (rotationId) => {
//     try {
//       await Instance.patch(`/api/rotation-arbitres/assigner`, {
//         rotation_id: rotationId,
//         poste: null,
//       });

//       onRefresh();
//     } catch (error) {
//       console.error("Erreur lors de la libération du poste :", error);
//     }
//   };

//   // Définition des postes Kumite (WKF Standard)
//   const postesKumite = [
//     { id: 1, label: "Arbitre Central (Shushin)", color: "#2e7d32" },
//     { id: 2, label: "Juge 1 (Coin Aka)", color: "#d32f2f" },
//     { id: 3, label: "Juge 2 (Coin Ao)", color: "#1976d2" },
//     { id: 4, label: "Juge 3 (Coin Aka)", color: "#d32f2f" },
//     { id: 5, label: "Juge 4 (Coin Ao)", color: "#1976d2" },
//     { id: 6, label: "Juge 5 (superviseur)", color: "#1976d2" },
//   ];

//   return (
//     <Stack
//       spacing={2}
//       sx={{
//         p: 2,
//         bgcolor: "#0e1118",
//         borderRadius: 4,
//         border: "1px solid #1e2433",
//         height: "100%",
//         overflowY: "auto",
//       }}
//     >
//       <Typography
//         variant="subtitle1"
//         sx={{
//           color: "#fff",
//           fontWeight: "bold",
//           display: "flex",
//           alignItems: "center",
//         }}
//       >
//         <Gavel sx={{ mr: 1, color: "#6c63ff" }} /> Panel Officiels Kumite
//         (4+1+1)
//       </Typography>

//       <Divider sx={{ bgcolor: "#1e2433" }} />

//       {!Array.isArray(arbitres) || arbitres.length === 0 ? (
//         <Stack
//           spacing={2}
//           sx={{
//             p: 3,
//             textAlign: "center",
//             border: "1px dashed #1e2433",
//             borderRadius: 4,
//           }}
//         >
//           <Typography variant="body2" color="text.secondary">
//             Aucun arbitre affecté au {config.plateau_nom}
//           </Typography>
//           <Button
//             variant="contained"
//             startIcon={<PersonAdd />}
//             onClick={chargerArbitresDispos}
//             sx={{ bgcolor: "#6c63ff" }}
//           >
//             Assigner des arbitres
//           </Button>
//         </Stack>
//       ) : (
//         <>
//           <List>
//             {arbitres.map((arbitre) => {
//               const aUnPoste = arbitre.poste !== null;
//               const estShushin = arbitre.poste === "shushin";
//               const estKansa = arbitre.est_superviseur;

//               return (
//                 <ListItem
//                   key={arbitre.id}
//                   sx={{
//                     bgcolor: estKansa ? "#1a1608" : "#141720",
//                     mb: 1,
//                     borderRadius: 2,
//                     borderLeft: estKansa
//                       ? "4px solid #ff9800"
//                       : estShushin
//                         ? "4px solid #2e7d32"
//                         : "none",
//                     transition: "0.3s",
//                   }}
//                   secondaryAction={
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       {/* GESTION DES POSTES (CENTRAL OU COINS) */}
//                       {aUnPoste ? (
//                         <Chip
//                           label={
//                             estShushin ? "CENTRAL" : `JUGE ${arbitre.poste}`
//                           }
//                           size="small"
//                           sx={{
//                             fontWeight: "bold",
//                             bgcolor: estShushin ? "#2e7d32" : "#1e2433",
//                             color: "#fff",
//                           }}
//                         />
//                       ) : (
//                         !estKansa && (
//                           <Button
//                             variant="outlined"
//                             size="small"
//                             startIcon={<Chair />}
//                             onClick={(e) => handleOuvrirMenuPostes(e, arbitre)}
//                             sx={{ fontSize: "0.6rem", borderColor: "#1e2433" }}
//                           >
//                             Assigner
//                           </Button>
//                         )
//                       )}

//                       {/* GESTION DU KANSA (SUPERVISEUR) */}
//                       {!estKansa ? (
//                         <IconButton
//                           size="small"
//                           onClick={() =>
//                             handleDesignerSuperviseur(
//                               config.id,
//                               arbitre.arbitre_competition_id,
//                             )
//                           }
//                           title="Désigner Kansa"
//                         >
//                           <Shield sx={{ color: "#636b88", fontSize: 18 }} />
//                         </IconButton>
//                       ) : (
//                         <Chip
//                           label="KANSA"
//                           size="small"
//                           sx={{
//                             bgcolor: "#ff9800",
//                             color: "#000",
//                             fontWeight: "bold",
//                           }}
//                         />
//                       )}

//                       {/* LIBÉRER LE POSTE */}
//                       {(aUnPoste || estKansa) && (
//                         <IconButton
//                           size="small"
//                           color="error"
//                           onClick={() => handleLibérerPoste(arbitre.id)}
//                         >
//                           <Logout fontSize="small" />
//                         </IconButton>
//                       )}
//                     </Stack>
//                   }
//                 >
//                   <ListItemText
//                     primary={arbitre.nom}
//                     secondary={
//                       estKansa
//                         ? "Superviseur de table"
//                         : estShushin
//                           ? "Arbitre Central"
//                           : "Officiel"
//                     }
//                     primaryTypographyProps={{
//                       color: "#dde1f0",
//                       variant: "body2",
//                       fontWeight: 600,
//                     }}
//                     secondaryTypographyProps={{
//                       color: estKansa ? "#ff9800" : "#636b88",
//                       fontSize: 11,
//                     }}
//                   />
//                 </ListItem>
//               );
//             })}
//           </List>
//           <Button
//             fullWidth
//             variant="outlined"
//             onClick={() => setOpenModal(true)}
//             sx={{ mt: 1, borderColor: "#1e2433", color: "#636b88" }}
//           >
//             + Ajouter au groupe
//           </Button>
//         </>
//       )}

//       {/* MENU DES POSTES SPÉCIFIQUES KUMITE */}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={() => setAnchorEl(null)}
//         PaperProps={{
//           sx: {
//             bgcolor: "#0e1118",
//             border: "1px solid #1e2433",
//             color: "#fff",
//           },
//         }}
//       >
//         {postesKumite.map((role) => {
//           const estPris = arbitres.some((a) => a.poste === role.id);
//           return (
//             <MenuItem
//               key={role.id}
//               disabled={estPris}
//               onClick={() => {
//                 handleAssignerPoste(arbitreEnCours.id, role.id);
//                 setAnchorEl(null);
//               }}
//               sx={{ fontSize: "0.85rem", "&:hover": { bgcolor: "#1e2433" } }}
//             >
//               <Box
//                 sx={{
//                   width: 10,
//                   height: 10,
//                   borderRadius: "50%",
//                   bgcolor: role.color,
//                   mr: 1,
//                 }}
//               />
//               {role.label} {estPris && "(Occupé)"}
//             </MenuItem>
//           );
//         })}
//       </Menu>

//       <Modal open={openModal} onClose={() => setOpenModal(false)}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 400,
//             bgcolor: "#0e1118",
//             border: "1px solid #1e2433",
//             borderRadius: 4,
//             p: 3,
//             boxShadow: 24,
//           }}
//         >
//           <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
//             Arbitres disponibles
//           </Typography>
//           <Divider sx={{ mb: 2, bgcolor: "#1e2433" }} />

//           <List sx={{ maxHeight: 400, overflow: "auto" }}>
//             {arbitresDispos.length > 0 ? (
//               arbitresDispos.map((arb) => (
//                 <ListItem
//                   key={arb.id}
//                   button
//                   onClick={() => assignerArbitre(arb.id)}
//                   sx={{
//                     "&:hover": { bgcolor: "#141720" },
//                     borderRadius: 2,
//                     mb: 1,
//                   }}
//                 >
//                   <ListItemText
//                     primary={arb.user.fullname || "Nom inconnu"}
//                     secondary={arb.grade || "Arbitre Officiel"}
//                     primaryTypographyProps={{
//                       color: "#dde1f0",
//                       fontWeight: 600,
//                     }}
//                     secondaryTypographyProps={{
//                       color: "#636b88",
//                       fontSize: 12,
//                     }}
//                   />
//                   <AddCircle sx={{ color: "#6c63ff" }} />
//                 </ListItem>
//               ))
//             ) : (
//               <Typography sx={{ color: "#636b88", textAlign: "center", py: 2 }}>
//                 Aucun autre arbitre inscrit à cet événement.
//               </Typography>
//             )}
//           </List>
//         </Box>
//       </Modal>
//     </Stack>
//   );
// };

// export default ArbitresKumitePanel;

import React, { useState } from "react";
import {
  Stack,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  Box,
  Modal,
  Menu,
  MenuItem,
  CircularProgress,
  Fade,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  PersonAdd,
  Logout,
  Chair,
  AddCircle,
  Gavel,
  Shield,
  Warning,
} from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";

const postesKumite = [
  { id: 1, label: "Arbitre Central (Shushin)", color: "#2e7d32" },
  { id: 2, label: "Juge 1 (Coin Aka)", color: "#d32f2f" },
  { id: 3, label: "Juge 2 (Coin Ao)", color: "#1976d2" },
  { id: 4, label: "Juge 3 (Coin Aka)", color: "#d32f2f" },
  { id: 5, label: "Juge 4 (Coin Ao)", color: "#1976d2" },
  { id: 6, label: "Kansa (superviseur)", color: "#ff9800" },
];

// ─── Carte arbitre kumite ─────────────────────────────────────────────────────
const ArbitreKumiteItem = ({
  arbitre,
  arbitres,
  onOuvrirMenuPostes,
  onDesignerSuperviseur,
  onLibérerPoste,
  config,
}) => {
  const aUnPoste = arbitre.poste !== null;
  const estShushin = arbitre.poste === "shushin" || arbitre.poste === 1;
  const estKansa = arbitre.est_superviseur;

  const posteLabel = estShushin
    ? "CENTRAL"
    : aUnPoste
      ? `JUGE ${arbitre.poste}`
      : null;

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: estKansa ? "rgba(255,152,0,0.06)" : "#141720",
        border: "1px solid",
        borderColor: estKansa
          ? "rgba(255,152,0,0.25)"
          : estShushin
            ? "rgba(46,125,50,0.25)"
            : "#1e2433",
        borderLeft: "3px solid",
        borderLeftColor: estKansa
          ? "#ff9800"
          : estShushin
            ? "#2e7d32"
            : "#1e2433",
        transition: "all 0.2s",
        mb: 1,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        flexWrap="wrap"
      >
        {/* Infos */}
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: estKansa ? "rgba(255,152,0,0.15)" : "#1e2433",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{
                color: estKansa
                  ? "#ff9800"
                  : estShushin
                    ? "#2e7d32"
                    : "#8b90a0",
                fontSize: "0.75rem",
              }}
            >
              {arbitre.nom?.charAt(0)?.toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: "#dde1f0" }}
              noWrap
            >
              {arbitre.nom}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: estKansa
                  ? "#ff9800"
                  : estShushin
                    ? "#4ade80"
                    : "#636b88",
                fontSize: "0.65rem",
              }}
            >
              {estKansa
                ? "Kansa (Superviseur)"
                : estShushin
                  ? "Arbitre Central"
                  : "Officiel"}
            </Typography>
          </Box>
        </Stack>

        {/* Actions */}
        <Stack
          direction="row"
          alignItems="center"
          gap={0.5}
          flexWrap="wrap"
          sx={{ flexShrink: 0 }}
        >
          {/* Badge poste */}
          {aUnPoste ? (
            <Chip
              label={posteLabel}
              size="small"
              sx={{
                fontWeight: "bold",
                height: 22,
                fontSize: "0.62rem",
                bgcolor: estShushin ? "#2e7d3230" : "#1e2433",
                color: estShushin ? "#4ade80" : "#dde1f0",
              }}
            />
          ) : (
            !estKansa && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Chair sx={{ fontSize: "0.7rem !important" }} />}
                onClick={(e) => onOuvrirMenuPostes(e, arbitre)}
                sx={{
                  fontSize: "0.62rem",
                  py: 0.3,
                  px: 0.8,
                  height: 24,
                  borderColor: "#1e2433",
                  color: "#8b90a0",
                  minWidth: "auto",
                }}
              >
                Poste
              </Button>
            )
          )}

          {/* Kansa badge ou bouton désigner */}
          {estKansa ? (
            <Chip
              label="KANSA"
              size="small"
              sx={{
                bgcolor: "#ff9800",
                color: "#000",
                fontWeight: "bold",
                height: 22,
                fontSize: "0.62rem",
              }}
            />
          ) : (
            <Tooltip title="Désigner Kansa">
              <IconButton
                size="small"
                onClick={() =>
                  onDesignerSuperviseur(
                    config.id,
                    arbitre.arbitre_competition_id,
                  )
                }
                sx={{ width: 26, height: 26 }}
              >
                <Shield
                  sx={{
                    color: "#636b88",
                    fontSize: 14,
                    "&:hover": { color: "#ff9800" },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}

          {/* Libérer */}
          {(aUnPoste || estKansa) && (
            <Tooltip title="Retirer du poste">
              <IconButton
                size="small"
                color="error"
                onClick={() => onLibérerPoste(arbitre.id)}
                sx={{ width: 26, height: 26 }}
              >
                <Logout sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

// ─── Modal arbitres disponibles ───────────────────────────────────────────────
const ModalArbitresDispos = ({ open, onClose, arbitresDispos, onAssigner }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "92vw", sm: 400 },
        bgcolor: "#0e1118",
        border: "1px solid #1e2433",
        borderRadius: 4,
        p: 3,
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}
        >
          Arbitres disponibles
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#636b88" }}>
          ✕
        </IconButton>
      </Stack>
      <Divider sx={{ mb: 2, bgcolor: "#1e2433" }} />
      <List sx={{ overflow: "auto", flex: 1 }}>
        {arbitresDispos.length > 0 ? (
          arbitresDispos.map((arb) => (
            <ListItem
              key={arb.id}
              button
              onClick={() => onAssigner(arb.id)}
              sx={{
                "&:hover": { bgcolor: "#141720" },
                borderRadius: 2,
                mb: 1,
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "#1e2433",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: "#6c63ff" }}
                >
                  {arb.user?.fullname?.charAt(0)?.toUpperCase()}
                </Typography>
              </Box>
              <ListItemText
                primary={arb.user?.fullname || "Nom inconnu"}
                secondary={arb.grade || "Arbitre Officiel"}
                primaryTypographyProps={{
                  color: "#dde1f0",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
                secondaryTypographyProps={{
                  color: "#636b88",
                  fontSize: "0.72rem",
                }}
              />
              <AddCircle sx={{ color: "#6c63ff", fontSize: 20 }} />
            </ListItem>
          ))
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#636b88", fontSize: "0.85rem" }}>
              Aucun arbitre disponible.
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  </Modal>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const ArbitresKumitePanel = ({
  config,
  arbitres,
  handleDesignerSuperviseur,
  onRefresh,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [arbitresDispos, setArbitresDispos] = useState([]);
  const [loadingArbitres, setLoadingArbitres] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [arbitreEnCours, setArbitreEnCours] = useState(null);

  const arbitresSafe = Array.isArray(arbitres) ? arbitres : [];

  const chargerArbitresDispos = async () => {
    if (!config?.evenement_id) return;
    setLoadingArbitres(true);
    try {
      const res = await Instance.get(
        `/api/arbitres/disponibles/${config.evenement_id}/${config.id}`,
      );
      setArbitresDispos(res.data);
      setOpenModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingArbitres(false);
    }
  };

  const assignerArbitre = async (arbitreCompId) => {
    await Instance.post(`/api/rotation-arbitres`, {
      config_notation_id: config.id,
      arbitre_competition_id: arbitreCompId,
    });
    setOpenModal(false);
    onRefresh();
  };

  const handleOuvrirMenuPostes = (event, arbitre) => {
    setAnchorEl(event.currentTarget);
    setArbitreEnCours(arbitre);
  };

  const handleAssignerPoste = async (rotationId, numeroPoste) => {
    try {
      const response = await Instance.patch(`/api/rotation-arbitres/update`, {
        rotation_id: rotationId,
        poste: numeroPoste,
      });
      if (response.data.success) onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'assignation");
    }
  };

  const handleLibérerPoste = async (rotationId) => {
    try {
      await Instance.patch(`/api/rotation-arbitres/assigner`, {
        rotation_id: rotationId,
        poste: null,
      });
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  // Résumé postes
  const nbPostesOccupes = arbitresSafe.filter(
    (a) => a.poste !== null || a.est_superviseur,
  ).length;
  const hasKansa = arbitresSafe.some((a) => a.est_superviseur);

  return (
    <Stack
      spacing={2}
      sx={{
        p: { xs: 2, sm: 2 },
        bgcolor: "#0e1118",
        borderRadius: 4,
        border: "1px solid #1e2433",
        height: "100%",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#1e2433", borderRadius: 2 },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <Gavel sx={{ color: "#6c63ff", fontSize: 18 }} />
          <Typography
            variant="subtitle2"
            sx={{ color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}
          >
            Panel Officiels Kumite
          </Typography>
        </Stack>
        <Chip
          label={`${nbPostesOccupes}/6`}
          size="small"
          color={nbPostesOccupes === 6 ? "success" : "default"}
          sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
        />
      </Stack>

      {/* Alerte kansa manquant */}
      {arbitresSafe.length > 0 && !hasKansa && (
        <Alert
          severity="warning"
          icon={<Warning fontSize="small" />}
          sx={{ borderRadius: 2, py: 0.5, fontSize: "0.72rem" }}
        >
          Aucun Kansa désigné
        </Alert>
      )}

      <Divider sx={{ bgcolor: "#1e2433" }} />

      {/* Liste arbitres ou vide */}
      {arbitresSafe.length === 0 ? (
        <Stack
          spacing={2}
          sx={{
            p: 3,
            textAlign: "center",
            border: "1px dashed #1e2433",
            borderRadius: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#636b88", fontSize: "0.82rem" }}
          >
            Aucun officiel affecté au{" "}
            <strong style={{ color: "#dde1f0" }}>{config.plateau_nom}</strong>
          </Typography>
          <Button
            variant="contained"
            startIcon={
              loadingArbitres ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <PersonAdd />
              )
            }
            onClick={chargerArbitresDispos}
            disabled={loadingArbitres}
            sx={{
              bgcolor: "#6c63ff",
              "&:hover": { bgcolor: "#5a52d5" },
              fontSize: "0.82rem",
            }}
          >
            {loadingArbitres ? "Chargement..." : "Assigner des officiels"}
          </Button>
        </Stack>
      ) : (
        <>
          {arbitresSafe.map((arbitre) => (
            <ArbitreKumiteItem
              key={arbitre.id}
              arbitre={arbitre}
              arbitres={arbitresSafe}
              config={config}
              onOuvrirMenuPostes={handleOuvrirMenuPostes}
              onDesignerSuperviseur={handleDesignerSuperviseur}
              onLibérerPoste={handleLibérerPoste}
            />
          ))}
          <Button
            fullWidth
            variant="outlined"
            startIcon={
              loadingArbitres ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <PersonAdd />
              )
            }
            onClick={chargerArbitresDispos}
            disabled={loadingArbitres}
            sx={{
              mt: 0.5,
              borderColor: "#1e2433",
              color: "#636b88",
              fontSize: "0.78rem",
              "&:hover": { borderColor: "#6c63ff", color: "#6c63ff" },
            }}
          >
            {loadingArbitres ? "Chargement..." : "+ Ajouter au groupe"}
          </Button>
        </>
      )}

      {/* Menu postes kumite */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: "#0e1118",
            border: "1px solid #1e2433",
            color: "#fff",
            borderRadius: 2,
            minWidth: 220,
          },
        }}
      >
        {postesKumite.map((role) => {
          const estPris = arbitresSafe.some((a) => a.poste === role.id);
          return (
            <MenuItem
              key={role.id}
              disabled={estPris}
              onClick={() => {
                handleAssignerPoste(arbitreEnCours.id, role.id);
                setAnchorEl(null);
              }}
              sx={{
                fontSize: "0.82rem",
                "&:hover": { bgcolor: "#1e2433" },
                color: estPris ? "#636b88" : "#dde1f0",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: role.color,
                  flexShrink: 0,
                }}
              />
              {role.label}
              {estPris && (
                <Chip
                  label="Occupé"
                  size="small"
                  sx={{
                    ml: "auto",
                    height: 16,
                    fontSize: "0.58rem",
                    bgcolor: "#1e2433",
                    color: "#636b88",
                  }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Modal */}
      <ModalArbitresDispos
        open={openModal}
        onClose={() => setOpenModal(false)}
        arbitresDispos={arbitresDispos}
        onAssigner={assignerArbitre}
      />
    </Stack>
  );
};

export default ArbitresKumitePanel;