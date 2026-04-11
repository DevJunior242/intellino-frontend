import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  Modal,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import NotesProgress from "./NotesProgress";
import {
  AddCircle,
  Chair,
  Logout,
  Person,
  PersonAdd,
  Star,
} from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";

export default function SeanceAdminPanelKata({
  config,
  data,
  handleLaunchSeance,
  handleValider,
  handleDesignerSuperviseur,
  success,
  errors,
  submitId,
  onRefresh,
}) {
  const [openModal, setOpenModal] = useState(false);
  const [arbitresDispos, setArbitresDispos] = useState([]);
  const { enCours, arbitres, superviseur } = data;
  console.log("data", data);
  const [notes, setNotes] = useState([]);
  const isValidated = config.est_valide;
  const actifs = arbitres.filter((a) => a.actif);
  console.log("actifs", actifs);
  console.log("config", config);

  const chargerArbitresDispos = async () => {
    console.log("Config sélectionnée:", config);

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
      {/* Header tatami */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="white">
            {config.evenement_nom} - {config?.plateau_nom ?? "Tatami"}
          </Typography>
          <Stack direction="row" gap={1} mt={0.5}>
            <Chip
              label={config?.mode_saisie ?? "—"}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${config?.juges_option} juges`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={isValidated ? "● Actif" : "○ En attente"}
              size="small"
              color={isValidated ? "success" : "default"}
            />
          </Stack>
        </Box>

        {/* Superviseur */}
        {superviseur ? (
          <Alert
            severity="warning"
            icon={<Star fontSize="small" />}
            sx={{ borderRadius: 2, py: 0.5 }}
          >
            Superviseur : {superviseur.nom}
          </Alert>
        ) : (
          <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
            Aucun superviseur
          </Alert>
        )}
      </Stack>

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

      {/* Boutons action selon état */}
      {!isValidated ? (
        <Button
          fullWidth
          variant="contained"
          disabled={submitId !== null}
          onClick={() => handleValider(config.id)}
          sx={{ mb: 3, py: 1.5, borderRadius: 3 }}
        >
          {submitId === config.id ? (
            <CircularProgress size={24} />
          ) : (
            "Valider la configuration"
          )}
        </Button>
      ) : !enCours ? (
        <Button
          fullWidth
          variant="contained"
          color="success"
          disabled={!superviseur}
          onClick={() => handleLaunchSeance(config.id)}
          sx={{ mb: 3, py: 1.5, borderRadius: 3, fontWeight: "bold" }}
        >
          {superviseur
            ? "▶ Lancer la séance"
            : "⚠️ Désignez un superviseur d'abord"}
        </Button>
      ) : null}

      {/* Athlète en cours + notes */}
      {enCours && (
        <>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "primary.light",
              bgcolor: "primary.50",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {enCours?.inscription?.athlete?.fullname ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passage N°{enCours?.ordre ?? "—"} · Catégorie :{" "}
                  {enCours?.inscription?.competition?.category?.nom ?? "—"}({" "}
                  {enCours?.inscription?.competition?.category?.sexe ?? "—"})
                </Typography>
              </Box>
              <Chip
                label={`${notes.length}/${config?.juges_option} notes`}
                color={
                  notes.length === config?.juges_option ? "success" : "warning"
                }
              />
            </Stack>
          </Paper>

          {/* Notes en direct */}
          <NotesProgress
            ordrePassageId={enCours?.id ?? null}
            nbJuges={config?.juges_option}
            onNotesChange={setNotes}
          />
        </>
      )}

      {/* Arbitres actifs — désigner superviseur */}
      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Arbitres actifs — désigner superviseur
        </Typography>
      </Divider>
      {/* arbitresactif */}

      <Stack spacing={1}>
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
              Aucun arbitre n'est affecté au{" "}
              <strong>{config.plateau_nom}</strong>
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={chargerArbitresDispos}
              sx={{ bgcolor: "#6c63ff", "&:hover": { bgcolor: "#5a52d5" } }}
            >
              Assigner des arbitres
            </Button>
          </Stack>
        ) : (
          <>
            {/* Ta liste d'arbitres existante... */}

            <List>
              {arbitres.map((arbitre) => {
                const aUnPoste = arbitre.poste !== null;

                return (
                  <ListItem
                    key={arbitre.id}
                    sx={{ bgcolor: "background.paper", mb: 1, borderRadius: 2 }}
                    secondaryAction={
                      <Stack direction="row" alignItems="center">
                        {aUnPoste ? (
                          <>
                            {/* CAS : L'ARBITRE EST DÉJÀ EN POSTE */}
                            <Chip
                              label={`Juge ${arbitre.poste}`}
                              color="primary"
                              size="small"
                              sx={{ fontWeight: "bold", mr: 1 }}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleLibérerPoste(arbitre.id)}
                              title="Remettre au banc"
                            >
                              <Logout fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            {/* CAS : L'ARBITRE EST AU BANC (POSTE NULL) */}
                            <Typography
                              variant="caption"
                              sx={{ mr: 1, color: "text.secondary" }}
                            >
                              Au banc
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Chair />}
                              onClick={(e) =>
                                handleOuvrirMenuPostes(e, arbitre)
                              }
                              sx={{ fontSize: "0.7rem", py: 0 }}
                            >
                              Assigner
                            </Button>
                          </>
                        )}
                        {!arbitre.est_superviseur && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PersonAdd />}
                            onClick={() =>
                              handleDesignerSuperviseur(
                                config.id,
                                arbitre.arbitre_competition_id,
                              )
                            }
                            sx={{ fontSize: "0.7rem", py: 0 }}
                          >
                            {arbitre.est_superviseur
                              ? "🔄 Changer"
                              : "⭐ Désigner"}
                          </Button>
                        )}
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={arbitre.nom}
                      secondary={
                        arbitre.est_superviseur ? "Superviseur" : "Arbitre"
                      }
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 600,
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
            <Button
              fullWidth
              variant="outlined"
              onClick={chargerArbitresDispos}
              sx={{ mt: 2, borderColor: "#1e2433", color: "#636b88" }}
            >
              + Ajouter un arbitre
            </Button>
          </>
        )}
      </Stack>
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          // Optionnel : masquer les numéros déjà pris par d'autres
          const estPris = arbitres.some((a) => a.poste === num);

          return (
            <MenuItem
              key={num}
              disabled={estPris}
              onClick={() => {
                handleAssignerPoste(arbitreEnCours.id, num);
                setAnchorEl(null);
              }}
            >
              Assigner au Poste {num} {estPris && "(Occupé)"}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
