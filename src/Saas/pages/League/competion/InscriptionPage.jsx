import { useState, useCallback, useEffect, act } from "react";
import {
  Container,
  Typography,
  Stack,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Divider,
  Button,
  Collapse,
  IconButton,
  Alert,
} from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import InscriptionForm from "./InscriptionForm";
import InscribedAthletesTable from "./InscribedAthletesTable";
import { UseAuth } from "../../../../Api/AuthContext";
import { Instance } from "../../../../Api/Axios";
import ConfigSkeleton from "../../ConfigSkeleton";

// ─── helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
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

const DISC_COLOR = { kumite: "error", kata: "success" };

// ─── Carte épreuve ────────────────────────────────────────────────────────────
const EpreuveCard = ({ epreuve, selected, onSelect }) => {
  const discNom = epreuve.discipline?.nom?.toLowerCase() ?? "";
  const discColor = DISC_COLOR[discNom] ?? "default";

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: "background.default",
        transition: "all 0.2s",
        cursor: "pointer",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
      }}
      onClick={onSelect}
    >
      <CardContent>
        {/* Discipline + catégorie */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <SportsMartialArtsIcon
              fontSize="small"
              color={discNom === "kumite" ? "error" : "success"}
            />
            <Typography variant="body1" fontWeight="bold">
              {epreuve.category?.nom ?? "—"}
            </Typography>
          </Stack>
          <Chip
            label={
              epreuve.category?.sexe === "M"
                ? "Masculin"
                : epreuve.category?.sexe === "F"
                  ? "Féminin"
                  : "Mixte"
            }
            size="small"
            variant="outlined"
          />
        </Stack>

        {/* Discipline */}
        <Chip
          label={epreuve.discipline?.nom ?? "—"}
          size="small"
          color={discColor}
          sx={{ mb: 1.5 }}
        />

        <Divider sx={{ my: 1 }} />

        {/* Infos */}
        <Stack spacing={0.8}>
          <Stack direction="row" alignItems="center" gap={1}>
            <CalendarMonthIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {formatHeure(epreuve.heure_debut_prevu)} —{" "}
              {formatHeure(epreuve.heure_fin_prevue)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            <GroupIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {epreuve.inscriptions_count ?? 0} inscrits
            </Typography>
          </Stack>
          <Chip
            label={epreuve.niveau?.nom ?? "—"}
            size="small"
            variant="outlined"
            color="info"
          />
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={selected ? "contained" : "outlined"}
          startIcon={<PersonAddAltIcon />}
          size="small"
        >
          {selected ? "Sélectionnée ✓" : "Inscrire ici"}
        </Button>
      </CardActions>
    </Card>
  );
};

// ─── Carte événement (expandable) ────────────────────────────────────────────
const EvenementCard = ({ evenement, selectedEpreuveId, onSelectEpreuve }) => {
  const [open, setOpen] = useState(false);
  const epreuves = evenement.competitions ?? [];
  const hasSelected = epreuves.some((ep) => ep.id === selectedEpreuveId);

  return (
    <Card
      raised={hasSelected}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "2px solid",
        cursor: "pointer",

        borderColor: hasSelected ? "primary.main" : "divider",
        bgcolor: "background.default",
        transition: "all 0.2s",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        {/* Header événement */}
        <Stack direction="row" alignItems="flex-start" gap={2} mb={1.5}>
          <Avatar
            sx={{
              bgcolor: hasSelected ? "primary.main" : "grey.400",
              width: 48,
              height: 48,
            }}
          >
            <EmojiEventsIcon />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
              {evenement.nom}
            </Typography>
            <Chip
              label={`${epreuves.length} épreuve${epreuves.length > 1 ? "s" : ""}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Stack>

        <Stack spacing={0.8} color="text.secondary" mb={1.5}>
          <Stack direction="row" gap={1} alignItems="center">
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2">{evenement.lieu}</Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            <CalendarMonthIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {formatDate(evenement.date_debut)}
              {evenement.date_fin !== evenement.date_debut &&
                ` → ${formatDate(evenement.date_fin)}`}
            </Typography>
          </Stack>
        </Stack>

        {/* Disciplines disponibles */}
        <Stack direction="row" gap={0.5} flexWrap="wrap">
          {[
            ...new Set(epreuves.map((e) => e.discipline?.nom).filter(Boolean)),
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
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, flexDirection: "column", gap: 1 }}>
        <Button
          fullWidth
          variant={open ? "contained" : "outlined"}
          onClick={() => setOpen(!open)}
          endIcon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        >
          {open ? "Masquer les épreuves" : "Voir les épreuves"}
        </Button>
      </CardActions>

      {/* Épreuves dépliées */}
      <Collapse in={open} timeout="auto">
        <Divider />
        <Box sx={{ p: 2, bgcolor: "grey.50" }}>
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing={1}
            display="block"
            mb={1.5}
          >
            Choisissez une épreuve
          </Typography>
          <Stack spacing={1.5}>
            {epreuves.map((ep) => (
              <EpreuveCard
                key={ep.id}
                epreuve={ep}
                selected={selectedEpreuveId === ep.id}
                onSelect={() => onSelectEpreuve(ep, evenement)}
              />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGE PRINCIPALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const InscriptionPage = () => {
  const { activeId, activeType } = UseAuth();

  // ── données ─────────────────────────────────────────────────────────────────
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── sélection ───────────────────────────────────────────────────────────────
  const [selectedEpreuve, setSelectedEpreuve] = useState(null);
  const [selectedEvenement, setSelectedEvenement] = useState(null);

  // ── inscriptions ─────────────────────────────────────────────────────────────
  const [inscriptions, setInscriptions] = useState([]);
  const [epreuve, setEpreuve] = useState({});
  const [tableLoading, setTableLoading] = useState(false);

  // ── fetch événements ─────────────────────────────────────────────────────────
  const fetchEvenements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await Instance.get(
        `/api/evenements/ouverts?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      setEvenements(res.data.evenements || []);
    } catch (err) {
      setError("Impossible de charger les événements.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId, activeType]);

  useEffect(() => {
    if (!activeId) return;
    fetchEvenements();
  }, [fetchEvenements, activeId]);

  // ── fetch inscriptions d'une épreuve ─────────────────────────────────────────
  const fetchInscriptions = useCallback(async () => {
    if (!selectedEpreuve?.id) return;
    setTableLoading(true);
    try {
      const res = await Instance.get(
        `/api/inscriptions/epreuve/${selectedEpreuve.id}?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log("inscrit", res);
      setInscriptions(res.data.inscriptions || []);
      setEpreuve(res.data.epreuve);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  }, [selectedEpreuve, activeId]);

  useEffect(() => {
    fetchInscriptions();
  }, [fetchInscriptions]);

  // ── sélectionner une épreuve ─────────────────────────────────────────────────
  const handleSelectEpreuve = (epreuve, evenement) => {
    setSelectedEpreuve(epreuve);
    setSelectedEvenement(evenement);
    setInscriptions([]);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* ── En-tête ── */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <FactCheckIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Portail Inscriptions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inscrivez vos athlètes aux épreuves disponibles
          </Typography>
        </Box>
      </Stack>

      {/* ── Erreur ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ── SECTION 1 : Swiper événements ── */}
      <Box sx={{ mb: 4, backgroundColor: "background.default" }}>
        <Typography
          variant="h6"
          gutterBottom
          color="text.secondary"
          fontWeight="bold"
        >
          1. Sélectionnez un événement et une épreuve
        </Typography>

        {loading ? (
          <ConfigSkeleton />
        ) : evenements.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              backgroundColor: "background.default",
            }}
          >
            <EmojiEventsIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography color="text.secondary" variant="h6">
              Aucun événement disponible
            </Typography>
          </Box>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 1 },
              900: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
            style={{ padding: "10px 0 50px 0" }}
          >
            {evenements.map((ev) => (
              <SwiperSlide key={ev.id} style={{ height: "auto" }}>
                <EvenementCard
                  evenement={ev}
                  selectedEpreuveId={selectedEpreuve?.id}
                  onSelectEpreuve={handleSelectEpreuve}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Box>

      {/* ── SECTION 2 : Zone d'inscription ── */}
      {selectedEpreuve && selectedEvenement && (
        <Box
          sx={{
            bgcolor: "background.default",
            borderRadius: 3,
            boxShadow: 2,
            maxWidth: 900,
            mx: "auto",
            p: 3,
            animation: "fadeIn 0.4s ease-in-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(10px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* Header zone inscription */}

          <Stack
            direction="row"
            gap={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{ mb: 3 }}
          >
            {" "}
            <Avatar
              sx={{
                bgcolor:
                  selectedEpreuve.discipline?.nom?.toLowerCase() === "kumite"
                    ? "error.main"
                    : "success.main",
                width: 48,
                height: 48,
              }}
            >
              <SportsMartialArtsIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {selectedEvenement.nom} — {selectedEpreuve.category?.nom}
              </Typography>
              <Stack direction="row" gap={1} m={1}>
                <Chip
                  label={selectedEpreuve.discipline?.nom ?? "—"}
                  size="small"
                  color={
                    DISC_COLOR[
                      selectedEpreuve.discipline?.nom?.toLowerCase()
                    ] ?? "default"
                  }
                />
                <Chip
                  label={
                    selectedEpreuve.category?.sexe === "M"
                      ? "Masculin"
                      : selectedEpreuve.category?.sexe === "F"
                        ? "Féminin"
                        : "Mixte"
                  }
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${formatHeure(selectedEpreuve.heure_debut_prevu)} – ${formatHeure(selectedEpreuve.heure_fin_prevue)}`}
                  size="small"
                  variant="outlined"
                  color="info"
                />
              </Stack>
            </Box>
          </Stack>

          <InscriptionForm
            competitionId={selectedEpreuve.id}
            discipline={selectedEpreuve.discipline?.nom}
            onSuccess={fetchInscriptions}
          />

          <Divider sx={{ mb: 3 }} />

          {/* Tableau des inscrits */}
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={2}
              textAlign="center"
            >
              Athlètes inscrits ({inscriptions.length})
            </Typography>
            <InscribedAthletesTable
              data={inscriptions}
              epreuve={epreuve}
              loading={tableLoading}
              onDelete={fetchInscriptions}
            />
          </Box>
        </Box>
      )}

      {/* Message si rien sélectionné */}
      {!selectedEpreuve && !loading && evenements.length > 0 && (
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ my: 8 }}
        >
          Ouvrez un événement et sélectionnez une épreuve pour commencer les
          inscriptions.
        </Typography>
      )}
    </Container>
  );
};

export default InscriptionPage;

// <Grid item xs={12} md={8}>
//   <Stack direction="row" alignItems="center" gap={1.5}>
//     <Avatar
//       sx={{
//         bgcolor:
//           selectedEpreuve.discipline?.nom?.toLowerCase() === "kumite"
//             ? "error.main"
//             : "success.main",
//         width: 48,
//         height: 48,
//       }}
//     >
//       <SportsMartialArtsIcon />
//     </Avatar>
//     <Box>
//       <Typography variant="h5" fontWeight="bold">
//         {selectedEvenement.nom} — {selectedEpreuve.category?.nom}
//       </Typography>
//       <Stack direction="row" gap={1} mt={0.5}>
//         <Chip
//           label={selectedEpreuve.discipline?.nom ?? "—"}
//           size="small"
//           color={
//             DISC_COLOR[selectedEpreuve.discipline?.nom?.toLowerCase()] ??
//             "default"
//           }
//         />
//         <Chip
//           label={
//             selectedEpreuve.category?.sexe === "M"
//               ? "Masculin"
//               : selectedEpreuve.category?.sexe === "F"
//                 ? "Féminin"
//                 : "Mixte"
//           }
//           size="small"
//           variant="outlined"
//         />
//         <Chip
//           label={`${formatHeure(selectedEpreuve.heure_debut_prevu)} – ${formatHeure(selectedEpreuve.heure_fin_prevue)}`}
//           size="small"
//           variant="outlined"
//           color="info"
//         />
//       </Stack>
//     </Box>
//   </Stack>
// </Grid>;
