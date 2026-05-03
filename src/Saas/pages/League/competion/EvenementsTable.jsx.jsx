import { useState } from "react";
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
  Tooltip,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import GroupIcon from "@mui/icons-material/Group";
import { UseAuth } from "../../../../Api/AuthContext";
import Message from "../../Message";
import ConfigSkeleton from "../../ConfigSkeleton";

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
const EpreuveRow = ({ epreuve, handleEpreuveStatusChange, submittingComp }) => {
  const discNom = epreuve.discipline?.nom?.toLowerCase() ?? "";
  const discColor = DISC_COLOR[discNom] ?? "default";
  const status = getStatut(epreuve.status);

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
          label={epreuve.discipline?.nom ?? "—"}
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
            {formatHeure(epreuve.heure_debut_prevu)}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            →
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.800" }}>
            {formatHeure(epreuve.heure_fin_prevue)}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: "grey.800" }}>
          {epreuve.heure_debut_prevu
            ? new Date(epreuve.heure_debut_prevu).toLocaleDateString("fr-FR", {
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
      <TableCell>
        <Stack direction="row" gap={1}>
          {epreuve.status === 0 && (
            <Button
              disabled={submittingComp}
              variant="contained"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleEpreuveStatusChange(epreuve.id, "ouvrir");
              }}
            >
              ouvrir
            </Button>
          )}
          {epreuve.status === 1 && (
            <Button
              disabled={submittingComp}
              variant="contained"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleEpreuveStatusChange(epreuve.id, "cloturer");
              }}
            >
              Cloturer
            </Button>
          )}
          {epreuve.status === 2 && (
            <Button
              disabled={submittingComp}
              variant="contained"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleEpreuveStatusChange(epreuve.id, "ouvrir");
              }}
            >
              {submittingComp ? "Ouv..." : "Ouvrir"}
            </Button>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// ─── Ligne événement (expandable) ────────────────────────────────────────────
const EvenementRow = ({
  evenement,
  handleStatusChange,
  arbitre,
  auth,
  submitting,
  submittingComp,
  handleEpreuveStatusChange,
}) => {
  const [open, setOpen] = useState(false);
  const epreuves = evenement.competitions ?? [];
  const status = getStatut(evenement.status);
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
                epreuves.map((e) => e.discipline?.nom).filter(Boolean),
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

        {/* action  ouvrir / cloturer */}
        <TableCell>
          <Stack direction="row" gap={1}>
            {evenement.status === 0 && (
              <Button
                variant="contained"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(evenement.id, "ouvrir");
                }}
              >
                ouvrir
              </Button>
            )}
            {evenement.status === 1 && (
              <Button
                variant="contained"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(evenement.id, "cloturer");
                }}
              >
                Cloturer
              </Button>
            )}
            {evenement.status === 2 && (
              <Button
                disabled={submitting}
                variant="contained"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(evenement.id, "ouvrir");
                }}
              >
                {submitting ? "Ouv..." : "Ouvrir"}
              </Button>
            )}
            {/* arbitrer */}
            {arbitre && (
              <Button
                disabled={submitting}
                variant="contained"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(evenement.id, "arbitrer");
                }}
              >
                {submitting ? "Arb..." : "Arbitrer"}
              </Button>
            )}
          </Stack>
        </TableCell>
      </TableRow>

      {/* ── Épreuves expandées ── */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                bgcolor: "grey.50",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Header épreuves */}
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
                      <TableCell sx={{ color: "grey.800" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {epreuves.map((ep) => (
                      <EpreuveRow
                        key={ep.id}
                        epreuve={ep}
                        handleEpreuveStatusChange={handleEpreuveStatusChange}
                        submittingComp={submittingComp}
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

// ─── Composant principal ──────────────────────────────────────────────────────
export default function EvenementsTable({
  evenements = [],
  loading,
  submitting,
  handleStatusChange,
  handleEpreuveStatusChange,
  submittingComp,
  auth,
  arbitre,
  success,
  errors,
}) {
  if (loading) {
    return <ConfigSkeleton />;
  }

  if (evenements.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <EmojiEventsIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
          />
          <Typography color="text.secondary">
            Aucun événement trouvé.
          </Typography>
        </CardContent>
      </Card>
    );
  }

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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evenements.map((ev) => (
              <EvenementRow
                key={ev.id}
                evenement={ev}
                handleStatusChange={handleStatusChange}
                submittingComp={submittingComp}
                handleEpreuveStatusChange={handleEpreuveStatusChange}
                auth={auth}
                arbitre={arbitre}
                submitting={submitting}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {success && <Message text={success} type="success" />}
      {errors.general && <Message text={errors.general} type="error" />}
    </Card>
  );
}
