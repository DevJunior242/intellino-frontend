import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Skeleton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { Instance } from "../../../Api/Axios";

const ACCENT = "#3949AB";
const MUTED = "#6B7280";
const INK = "#1A1C2A";

// Badge d'affiliation d'un club pour la saison active : à jour (paid),
// en vérification (declared), ou non affilié (pending / aucune ligne).
const AFFILIATION_BADGES = {
  paid: { label: "À jour", icon: StarIcon, bg: "#E6F4EA", fg: "#1E7E34" },
  declared: { label: "En vérification", icon: AccessTimeIcon, bg: "#FFF4E5", fg: "#B26A00" },
  pending: { label: "Non affilié", icon: ErrorOutlineIcon, bg: "#FBE9E7", fg: "#C62828" },
};

function AffiliationBadge({ status }) {
  const badge = AFFILIATION_BADGES[status] || AFFILIATION_BADGES.pending;
  const Icon = badge.icon;
  return (
    <Chip
      icon={<Icon sx={{ fontSize: "14px !important", color: `${badge.fg} !important` }} />}
      label={badge.label}
      size="small"
      sx={{
        bgcolor: badge.bg,
        color: badge.fg,
        fontWeight: 700,
        fontSize: "0.68rem",
        height: 22,
      }}
    />
  );
}

function LeagueSkeletonList() {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height={56} sx={{ borderRadius: 2, mb: 1 }} />
      ))}
    </Box>
  );
}

export default function FederationStructure() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await Instance.get("/api/federation/ligues-clubs");
      const list = data.data || [];
      setLeagues(list);
      if (list.length > 0) setSelectedLeagueId((prev) => prev ?? list[0].id);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger les ligues.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recherche globale : matche soit le nom de la ligue, soit le nom d'un de ses clubs
  const filteredLeagues = useMemo(() => {
    if (!search.trim()) return leagues;
    const q = search.trim().toLowerCase();

    return leagues
      .map((league) => {
        const leagueMatches = league.name?.toLowerCase().includes(q);
        const matchingClubs = (league.clubs || []).filter((c) =>
          c.name?.toLowerCase().includes(q),
        );

        if (leagueMatches) return league; // ligue entière visible, tous ses clubs
        if (matchingClubs.length > 0)
          return { ...league, clubs: matchingClubs };
        return null;
      })
      .filter(Boolean);
  }, [leagues, search]);

  const selectedLeague = useMemo(
    () =>
      filteredLeagues.find((l) => l.id === selectedLeagueId) ||
      filteredLeagues[0] ||
      null,
    [filteredLeagues, selectedLeagueId],
  );

  const totalClubs = useMemo(
    () => leagues.reduce((sum, l) => sum + (l.clubs?.length || 0), 0),
    [leagues],
  );

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box mb={3}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "primary.light" }}
        >
          Ligues & clubs
        </Typography>
        <Typography variant="body2" sx={{ color: MUTED }}>
          {loading
            ? "Chargement…"
            : `${leagues.length} ligue${leagues.length > 1 ? "s" : ""} · ${totalClubs} club${totalClubs > 1 ? "s" : ""}`}
        </Typography>
      </Box>

      {/* Recherche globale */}
      <TextField
        fullWidth
        size="small"
        placeholder="Rechercher une ligue ou un club..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, maxWidth: 420 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: MUTED }} />
            </InputAdornment>
          ),
          sx: { borderRadius: 2, bgcolor: "#1a1d23" },
        }}
      />

      {loading && <LeagueSkeletonList />}

      {!loading && filteredLeagues.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: MUTED,
            border: "1px dashed #D1D5DB",
            borderRadius: 3,
          }}
        >
          <GroupsOutlinedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Aucun résultat
          </Typography>
          <Typography variant="body2">
            {search
              ? "Essayez une autre recherche."
              : "Aucune ligue rattachée pour le moment."}
          </Typography>
        </Box>
      )}

      {/* ---------- VUE MOBILE : accordéon ---------- */}
      {!loading && isMobile && filteredLeagues.length > 0 && (
        <Box>
          {filteredLeagues.map((league) => (
            <Accordion
              key={league.id}
              elevation={0}
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                mb: 1.5,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    width: "100%",
                  }}
                >
                  <Avatar sx={{ bgcolor: "#E8EAF6", width: 36, height: 36 }}>
                    <AccountBalanceIcon sx={{ color: ACCENT, fontSize: 18 }} />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                      {league.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: MUTED }}>
                      {(league.clubs || []).length} club
                      {(league.clubs || []).length > 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {(league.clubs || []).length === 0 ? (
                  <Typography variant="body2" sx={{ color: MUTED, py: 1 }}>
                    Aucun club rattaché à cette ligue.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {league.clubs.map((club) => (
                      <ListItem key={club.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton sx={{ borderRadius: 2 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BusinessIcon sx={{ fontSize: 18, color: MUTED }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={club.name}
                            secondary={club.city || club.address}
                            primaryTypographyProps={{
                              fontSize: "0.88rem",
                              fontWeight: 600,
                            }}
                            secondaryTypographyProps={{ fontSize: "0.75rem" }}
                          />
                          <AffiliationBadge status={club.affiliation_status} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* ---------- VUE DESKTOP : deux colonnes ---------- */}
      {!loading && !isMobile && filteredLeagues.length > 0 && (
        <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
          {/* Colonne gauche : ligues */}
          <Paper
            elevation={0}
            sx={{
              width: 300,
              flexShrink: 0,
              borderRadius: 3,
              border: "1px solid #E5E7EB",
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #F1F2F4" }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: MUTED,
                  textTransform: "uppercase",
                }}
              >
                Ligues
              </Typography>
            </Box>
            <List disablePadding sx={{ maxHeight: 480, overflowY: "auto" }}>
              {filteredLeagues.map((league) => {
                const isSelected = selectedLeague?.id === league.id;
                return (
                  <ListItem key={league.id} disablePadding>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => setSelectedLeagueId(league.id)}
                      sx={{
                        py: 1.25,
                        borderLeft: "3px solid",
                        borderLeftColor: isSelected ? ACCENT : "transparent",
                        bgcolor: isSelected ? "#E8EAF6" : "transparent",
                        "&:hover": {
                          bgcolor: isSelected ? "#E8EAF6" : "#FAFAFB",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AccountBalanceIcon
                          sx={{
                            fontSize: 18,
                            color: isSelected ? ACCENT : MUTED,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={league.name}
                        secondary={`${(league.clubs || []).length} club${(league.clubs || []).length > 1 ? "s" : ""}`}
                        primaryTypographyProps={{
                          fontSize: "0.88rem",
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? ACCENT : INK,
                        }}
                        secondaryTypographyProps={{ fontSize: "0.75rem" }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Paper>

          {/* Colonne droite : clubs de la ligue sélectionnée */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              borderRadius: 3,
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              minHeight: 200,
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid #F1F2F4",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: INK }}>
                {selectedLeague?.name || "Sélectionnez une ligue"}
              </Typography>
              {selectedLeague && (
                <Chip
                  label={`${(selectedLeague.clubs || []).length} club${(selectedLeague.clubs || []).length > 1 ? "s" : ""}`}
                  size="small"
                  sx={{
                    bgcolor: "#F3F4F6",
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </Box>

            {selectedLeague && (selectedLeague.clubs || []).length === 0 && (
              <Box sx={{ textAlign: "center", py: 6, color: MUTED }}>
                <BusinessIcon sx={{ fontSize: 28, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2">
                  Aucun club rattaché à cette ligue.
                </Typography>
              </Box>
            )}

            {selectedLeague && (selectedLeague.clubs || []).length > 0 && (
              <List disablePadding sx={{ p: 1 }}>
                {selectedLeague.clubs.map((club) => (
                  <ListItem key={club.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton sx={{ borderRadius: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar
                          sx={{ bgcolor: "#F3F4F6", width: 32, height: 32 }}
                        >
                          <BusinessIcon
                            sx={{ fontSize: 16, color: "#374151" }}
                          />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={club.name}
                        secondary={club.city || club.address}
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                        secondaryTypographyProps={{
                          fontSize: "0.78rem",
                          color: MUTED,
                        }}
                      />
                      <AffiliationBadge status={club.affiliation_status} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
