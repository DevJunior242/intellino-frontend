import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  TablePagination,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Message from "../../Message";
import ConfigSkeleton from "../../ConfigSkeleton";

const SlideUpTransition = React.forwardRef(
  function SlideUpTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

// ─── helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatHeure = (dt) =>
  dt
    ? new Date(dt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATUT_CONFIG = {
  0: { label: "Brouillon", color: "default" },
  1: { label: "En cours", color: "warning" },
  2: { label: "Terminé", color: "success" },
  brouillon: { label: "Brouillon", color: "default" },
  en_attente: { label: "En attente", color: "info" },
  en_cours: { label: "En cours", color: "warning" },
  termine: { label: "Terminé", color: "success" },
};

const DISC_COLOR = {
  kumite: "error",
  kata: "success",
};

const getStatut = (status) =>
  STATUT_CONFIG[status] ?? { label: String(status), color: "default" };

// ─── Ligne épreuve ────────────────────────────────────────────────────────────
const EpreuveRow = ({
  epreuve,
  handleEpreuveStatusChange,
  submittingCompId,
  allAccess,
}) => {
  const discNom = epreuve.sub_discipline?.nom?.toLowerCase() ?? "";
  const discColor = DISC_COLOR[discNom] ?? "default";
  const status = getStatut(epreuve.status);
  const isSubmitting = submittingCompId === epreuve.id;

  return (
    <TableRow hover sx={{ "& td": { py: 1.2 } }}>
      <TableCell sx={{ pl: 7 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <SportsMartialArtsIcon fontSize="small" color="action" />
          <Box>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ color: "grey.800" }}
            >
              {epreuve.category?.nom ?? "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "grey.800" }}>
              {epreuve.category?.sexe === "M"
                ? "Masculin"
                : epreuve.category?.sexe === "F"
                  ? "Féminin"
                  : "Mixte"}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Chip
          label={epreuve.sub_discipline?.nom ?? "—"}
          size="small"
          color={discColor}
          variant="outlined"
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: "grey.800" }}>
          {epreuve.niveau?.nom ?? "—"}
        </Typography>
      </TableCell>

      <TableCell sx={{ color: "grey.800" }}>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography variant="body2" sx={{ color: "grey.800" }}>
            {formatHeure(epreuve?.heure_debut_prevu)}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            →
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.800" }}>
            {formatHeure(epreuve?.heure_fin_prevue)}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: "grey.800" }}>
          {epreuve?.heure_debut_prevu
            ? new Date(epreuve?.heure_debut_prevu).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })
            : "—"}
        </Typography>
      </TableCell>

      <TableCell sx={{ color: "grey.800" }}>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <GroupIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {epreuve.inscriptions_count ?? 0}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Chip
          label={status.label}
          size="small"
          color={status.color}
          variant="filled"
        />
      </TableCell>

      {allAccess && (
        <TableCell>
          <Stack direction="row" gap={1}>
            {/* Bouton unique qui change de label/couleur selon status ET loading */}
            {epreuve.status === 0 || isSubmitting ? (
              <Button
                disabled={isSubmitting}
                variant="contained"
                color="success"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : null
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleEpreuveStatusChange(epreuve.id, "ouvrir");
                }}
              >
                {isSubmitting ? "Ouverture..." : "Ouvrir"}
              </Button>
            ) : epreuve.status === 1 ? (
              <Button
                disabled={isSubmitting}
                variant="contained"
                color="error"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : null
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleEpreuveStatusChange(epreuve.id, "cloturer");
                }}
              >
                {isSubmitting ? "Clôture..." : "Clôturer"}
              </Button>
            ) : epreuve.status === 2 ? (
              <Button
                disabled={isSubmitting}
                variant="contained"
                color="success"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : null
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleEpreuveStatusChange(epreuve.id, "ouvrir");
                }}
              >
                {isSubmitting ? "Ouverture..." : "Ouvrir"}
              </Button>
            ) : null}
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

// ─── Ligne événement (expandable) ────────────────────────────────────────────
const EvenementRow = ({
  evenement,
  handleStatusChange,
  handleEpreuveStatusChange,
  handleDelete,
  handleEdit,
  arbitre,
  auth,
  submittingId,
  submittingCompId,
  deletingId,
  allAccess,
}) => {
  const [open, setOpen] = useState(false);
  const epreuves = evenement.competitions ?? [];
  const status = getStatut(evenement.status);
  const isSubmitting = submittingId === evenement.id;
  const isDeleting = deletingId === evenement.id;

  if (!auth) return null;

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: "pointer",
          bgcolor: open ? "action.hover" : "inherit",
          "& td": { fontWeight: open ? 600 : 400 },
        }}
        onClick={() => setOpen(!open)}
      >
        {/* Expand icon */}
        <TableCell width={48}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        {/* Nom événement */}
        <TableCell>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
              <EmojiEventsIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {evenement.nom}
              </Typography>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <LocationOnIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {evenement.lieu}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </TableCell>

        {/* Dates */}
        <TableCell>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarMonthIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="body2">
                {formatDate(evenement.date_debut)}
              </Typography>
              {evenement.date_fin !== evenement.date_debut && (
                <Typography variant="caption" color="text.secondary">
                  → {formatDate(evenement.date_fin)}
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>

        {/* Épreuves count */}
        <TableCell>
          <Chip
            label={`${epreuves.length} épreuve${epreuves.length > 1 ? "s" : ""}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </TableCell>

        {/* Disciplines */}
        <TableCell>
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {[
              ...new Set(
                epreuves.map((e) => e.sub_discipline?.nom).filter(Boolean),
              ),
            ].map((disc) => (
              <Chip
                key={disc}
                label={disc}
                size="small"
                color={DISC_COLOR[disc.toLowerCase()] ?? "default"}
                variant="outlined"
              />
            ))}
          </Stack>
        </TableCell>

        {/* Statut */}
        <TableCell>
          <Chip label={status.label} size="small" color={status.color} />
        </TableCell>

        {/* Actions ouvrir / cloturer / editer / supprimer */}
        <TableCell>
          <Stack direction="row" gap={1} alignItems="center">
            {allAccess && (
              <>
                {evenement.status === 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : null
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(evenement.id, "ouvrir");
                    }}
                  >
                    {isSubmitting ? "Ouverture..." : "Ouvrir"}
                  </Button>
                )}
                {evenement.status === 1 && (
                  <Button
                    variant="contained"
                    color="error"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : null
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(evenement.id, "cloturer");
                    }}
                  >
                    {isSubmitting ? "Clôture..." : "Clôturer"}
                  </Button>
                )}
                {evenement.status === 2 && (
                  <Button
                    variant="contained"
                    color="success"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : null
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(evenement.id, "ouvrir");
                    }}
                  >
                    {isSubmitting ? "Ouverture..." : "Ouvrir"}
                  </Button>
                )}

                <IconButton
                  size="small"
                  color="primary"
                  disabled={isDeleting || isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(evenement);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  disabled={isDeleting || isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(evenement);
                  }}
                >
                  {isDeleting ? (
                    <CircularProgress size={18} color="error" />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
                </IconButton>
              </>
            )}

            {arbitre &&
              (evenement.arbitre_inscrit_count > 0 ? (
                <Chip label="Déjà inscrit" size="small" color="success" />
              ) : (
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(evenement.id, "arbitrer");
                  }}
                >
                  {isSubmitting ? "process..." : "S'inscrire"}
                </Button>
              ))}
          </Stack>
        </TableCell>
      </TableRow>

      {/* ── Épreuves expandées ── */}
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                bgcolor: "grey.50",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ px: 7, pt: 1.5, pb: 0.5 }}
              >
                <SportsMartialArtsIcon fontSize="small" color="primary" />
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="primary.main"
                  textTransform="uppercase"
                  letterSpacing={1}
                >
                  Programme des épreuves
                </Typography>
              </Stack>

              {epreuves.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 7, py: 2 }}
                >
                  Aucune épreuve planifiée.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          color: "text.secondary",
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        },
                      }}
                    >
                      <TableCell sx={{ pl: 7, color: "grey.800" }}>
                        Catégorie
                      </TableCell>
                      <TableCell sx={{ color: "grey.800" }}>
                        Discipline
                      </TableCell>
                      <TableCell sx={{ color: "grey.800" }}>Niveau</TableCell>
                      <TableCell sx={{ color: "grey.800" }}>Horaire</TableCell>
                      <TableCell sx={{ color: "grey.800" }}>Inscrits</TableCell>
                      <TableCell sx={{ color: "grey.800" }}>Statut</TableCell>
                      {/* visible pour arbitre et admin */}
                      {allAccess && (
                        <TableCell sx={{ color: "grey.800" }}>
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {epreuves.map((ep) => (
                      <EpreuveRow
                        key={ep.id}
                        epreuve={ep}
                        handleEpreuveStatusChange={handleEpreuveStatusChange}
                        submittingCompId={submittingCompId}
                        allAccess={allAccess}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ─── Dialog de confirmation suppression ──────────────────────────────────────
const DeleteConfirmDialog = ({
  open,
  evenement,
  deleting,
  onClose,
  onConfirm,
}) => (
  <Dialog
    open={open}
    onClose={deleting ? undefined : onClose}
    TransitionComponent={SlideUpTransition}
    keepMounted
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        p: 0.5,
      },
    }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            bgcolor: "rgba(244,67,54,0.12)",
            color: "error.main",
            width: 40,
            height: 40,
          }}
        >
          <WarningAmberRoundedIcon />
        </Avatar>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: "text.primary" }}
        >
          Supprimer cet événement ?
        </Typography>
      </Stack>
    </DialogTitle>

    <DialogContent sx={{ pt: 0.5 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Vous êtes sur le point de supprimer{" "}
        <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
          {evenement?.nom ?? "cet événement"}
        </Box>
        {evenement?.lieu ? ` (${evenement.lieu})` : ""}. Cette action est
        définitive et entraînera la suppression de toutes les épreuves et
        inscriptions associées.
      </Typography>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onClose}
        disabled={deleting}
        sx={{
          color: "text.secondary",
          textTransform: "none",
          borderRadius: 2,
        }}
      >
        Annuler
      </Button>
      <Button
        onClick={onConfirm}
        disabled={deleting}
        variant="contained"
        color="error"
        startIcon={
          deleting ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <DeleteIcon />
          )
        }
        sx={{ textTransform: "none", borderRadius: 2, px: 2.5 }}
      >
        {deleting ? "Suppression..." : "Supprimer"}
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Composant principal ──────────────────────────────────────────────────────
export default function EvenementsTable({
  evenements = [],
  loading,
  submittingId,
  submittingCompId,
  deletingId,
  handleStatusChange,
  handleEpreuveStatusChange,
  handleDelete,
  handleEdit,
  auth,
  arbitre,
  success,
  errors,
  allAccess,
  pagination,
  handlePageChange,
}) {
  // L'événement actuellement visé par une demande de suppression (ouvre le dialog).
  // handleDelete (reçu en prop) n'est appelé qu'à la confirmation explicite.
  const [eventToDelete, setEventToDelete] = useState(null);

  const requestDelete = (evenement) => setEventToDelete(evenement);
  const cancelDelete = () => setEventToDelete(null);

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    await handleDelete(eventToDelete.id);
    setEventToDelete(null);
  };

  const isDeletingTarget = eventToDelete && deletingId === eventToDelete.id;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "primary.main",
                "& th": { color: "white", fontWeight: 700, fontSize: 13 },
              }}
            >
              <TableCell width={48} />
              <TableCell>Événement</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Épreuves</TableCell>
              <TableCell>Disciplines</TableCell>
              <TableCell>Statut</TableCell>
              {/* visible pour arbitre et admin */}
              {allAccess && <TableCell>Actions</TableCell>}
              {/* visible pour arbitre */}
              {arbitre && <TableCell>Arbitres</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <ConfigSkeleton />
            ) : evenements.length > 0 ? (
              evenements.map((ev) => (
                <EvenementRow
                  key={ev.id}
                  evenement={ev}
                  handleStatusChange={handleStatusChange}
                  handleEpreuveStatusChange={handleEpreuveStatusChange}
                  handleDelete={requestDelete}
                  handleEdit={handleEdit}
                  auth={auth}
                  arbitre={arbitre}
                  allAccess={allAccess}
                  submittingId={submittingId}
                  submittingCompId={submittingCompId}
                  deletingId={deletingId}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={100}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: "center", py: 6 }}>
                      <EmojiEventsIcon
                        sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                      />
                      Aucun événement trouvé.
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination (basée sur ta réponse API) */}
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={(pagination.current_page || 1) - 1}
          rowsPerPage={pagination.per_page || 10}
          onPageChange={handlePageChange}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count}`
          }
        />
      </TableContainer>
      {success && <Message text={success} type="success" />}
      {errors?.general && <Message text={errors.general} type="error" />}

      <DeleteConfirmDialog
        open={Boolean(eventToDelete)}
        evenement={eventToDelete}
        deleting={Boolean(isDeletingTarget)}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
