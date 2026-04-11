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
  Avatar,
} from "@mui/material";
import {
  PersonAdd,
  Logout,
  Chair,
  AddCircle,
  Gavel,
  Shield,
} from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";

const ArbitresKumitePanel = ({
  config,
  arbitres,
  handleDesignerSuperviseur,
  onRefresh,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [arbitresDispos, setArbitresDispos] = useState([]);

  const chargerArbitresDispos = async () => {
    console.log("Config sélectionnée:", config);
    console.log("arbitres", arbitres);

    if (!config?.evenement_id) {
      console.error("ID Événement manquant !");
      return;
    }
    try {
      const res = await Instance.get(
        `/api/arbitres/disponibles/${config.evenement_id}/${config.id}`,
      );
      console.log("arbitres disponibles", res.data);
      setArbitresDispos(res.data);
      setOpenModal(true);
    } catch (error) {
      console.error("Erreur chargement arbitres", error);
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

  const [anchorEl, setAnchorEl] = useState(null);
  const [arbitreEnCours, setArbitreEnCours] = useState(null);

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

      if (response.data.success) {
        onRefresh();
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du poste :", error);
      const message =
        error.response?.data?.message || "Erreur lors de l'assignation";
      alert(message);
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
      console.error("Erreur lors de la libération du poste :", error);
    }
  };

  // Définition des postes Kumite (WKF Standard)
  const postesKumite = [
    { id: 1, label: "Arbitre Central (Shushin)", color: "#2e7d32" },
    { id: 2, label: "Juge 1 (Coin Aka)", color: "#d32f2f" },
    { id: 3, label: "Juge 2 (Coin Ao)", color: "#1976d2" },
    { id: 4, label: "Juge 3 (Coin Aka)", color: "#d32f2f" },
    { id: 5, label: "Juge 4 (Coin Ao)", color: "#1976d2" },
    { id: 6, label: "Juge 5 (superviseur)", color: "#1976d2" },
  ];

  return (
    <Stack
      spacing={2}
      sx={{
        p: 2,
        bgcolor: "#0e1118",
        borderRadius: 4,
        border: "1px solid #1e2433",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: "#fff",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Gavel sx={{ mr: 1, color: "#6c63ff" }} /> Panel Officiels Kumite
        (4+1+1)
      </Typography>

      <Divider sx={{ bgcolor: "#1e2433" }} />

      {!Array.isArray(arbitres) || arbitres.length === 0 ? (
        <Stack
          spacing={2}
          sx={{
            p: 3,
            textAlign: "center",
            border: "1px dashed #1e2433",
            borderRadius: 4,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Aucun arbitre affecté au {config.plateau_nom}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={chargerArbitresDispos}
            sx={{ bgcolor: "#6c63ff" }}
          >
            Assigner des arbitres
          </Button>
        </Stack>
      ) : (
        <>
          <List>
            {arbitres.map((arbitre) => {
              const aUnPoste = arbitre.poste !== null;
              const estShushin = arbitre.poste === "shushin";
              const estKansa = arbitre.est_superviseur;

              return (
                <ListItem
                  key={arbitre.id}
                  sx={{
                    bgcolor: estKansa ? "#1a1608" : "#141720",
                    mb: 1,
                    borderRadius: 2,
                    borderLeft: estKansa
                      ? "4px solid #ff9800"
                      : estShushin
                        ? "4px solid #2e7d32"
                        : "none",
                    transition: "0.3s",
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* GESTION DES POSTES (CENTRAL OU COINS) */}
                      {aUnPoste ? (
                        <Chip
                          label={
                            estShushin ? "CENTRAL" : `JUGE ${arbitre.poste}`
                          }
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: estShushin ? "#2e7d32" : "#1e2433",
                            color: "#fff",
                          }}
                        />
                      ) : (
                        !estKansa && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Chair />}
                            onClick={(e) => handleOuvrirMenuPostes(e, arbitre)}
                            sx={{ fontSize: "0.6rem", borderColor: "#1e2433" }}
                          >
                            Assigner
                          </Button>
                        )
                      )}

                      {/* GESTION DU KANSA (SUPERVISEUR) */}
                      {!estKansa ? (
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDesignerSuperviseur(
                              config.id,
                              arbitre.arbitre_competition_id,
                            )
                          }
                          title="Désigner Kansa"
                        >
                          <Shield sx={{ color: "#636b88", fontSize: 18 }} />
                        </IconButton>
                      ) : (
                        <Chip
                          label="KANSA"
                          size="small"
                          sx={{
                            bgcolor: "#ff9800",
                            color: "#000",
                            fontWeight: "bold",
                          }}
                        />
                      )}

                      {/* LIBÉRER LE POSTE */}
                      {(aUnPoste || estKansa) && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleLibérerPoste(arbitre.id)}
                        >
                          <Logout fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={arbitre.nom}
                    secondary={
                      estKansa
                        ? "Superviseur de table"
                        : estShushin
                          ? "Arbitre Central"
                          : "Officiel"
                    }
                    primaryTypographyProps={{
                      color: "#dde1f0",
                      variant: "body2",
                      fontWeight: 600,
                    }}
                    secondaryTypographyProps={{
                      color: estKansa ? "#ff9800" : "#636b88",
                      fontSize: 11,
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpenModal(true)}
            sx={{ mt: 1, borderColor: "#1e2433", color: "#636b88" }}
          >
            + Ajouter au groupe
          </Button>
        </>
      )}

      {/* MENU DES POSTES SPÉCIFIQUES KUMITE */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: "#0e1118",
            border: "1px solid #1e2433",
            color: "#fff",
          },
        }}
      >
        {postesKumite.map((role) => {
          const estPris = arbitres.some((a) => a.poste === role.id);
          return (
            <MenuItem
              key={role.id}
              disabled={estPris}
              onClick={() => {
                handleAssignerPoste(arbitreEnCours.id, role.id);
                setAnchorEl(null);
              }}
              sx={{ fontSize: "0.85rem", "&:hover": { bgcolor: "#1e2433" } }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: role.color,
                  mr: 1,
                }}
              />
              {role.label} {estPris && "(Occupé)"}
            </MenuItem>
          );
        })}
      </Menu>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#0e1118",
            border: "1px solid #1e2433",
            borderRadius: 4,
            p: 3,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
            Arbitres disponibles
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: "#1e2433" }} />

          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {arbitresDispos.length > 0 ? (
              arbitresDispos.map((arb) => (
                <ListItem
                  key={arb.id}
                  button
                  onClick={() => assignerArbitre(arb.id)}
                  sx={{
                    "&:hover": { bgcolor: "#141720" },
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={arb.user.fullname || "Nom inconnu"}
                    secondary={arb.grade || "Arbitre Officiel"}
                    primaryTypographyProps={{
                      color: "#dde1f0",
                      fontWeight: 600,
                    }}
                    secondaryTypographyProps={{
                      color: "#636b88",
                      fontSize: 12,
                    }}
                  />
                  <AddCircle sx={{ color: "#6c63ff" }} />
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#636b88", textAlign: "center", py: 2 }}>
                Aucun autre arbitre inscrit à cet événement.
              </Typography>
            )}
          </List>
        </Box>
      </Modal>
    </Stack>
  );
};

export default ArbitresKumitePanel;
