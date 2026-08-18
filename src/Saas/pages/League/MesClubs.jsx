import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  TablePagination,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { alpha, useTheme } from "@mui/material/styles";
import { Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ErrorBlock from "../ErrorBlock";

// --- Icons (Emoji ou MUI Icons) ---
const icons = {
  search: <Search />,
  add: "➕",
  export: "📤",
  filter: "⚙️",
  more: "⋮",
};
function MesClubs() {
  const theme = useTheme();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { activeId } = UseAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({});

  const handleOpenMenu = (event, club) => {
    setAnchorEl(event.currentTarget);
    setSelectedClub(club);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const getMyClubs = useCallback(
    async (searchVal = "", statusVal = "", page = 1) => {
      if (!activeId) return;

      setLoading(true);
      setError("");

      try {
        const response = await Instance.get(
          `api/leagues/myClubs?page=${page}&search=${searchVal}&status=${statusVal}`,
        );
        setPagination({
          total: response.data.total,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
        });
        setClubs(response.data.data || []);
      } catch (error) {
        setError("Une erreur est survenue lors de la récupération des clubs");
      } finally {
        setLoading(false);
      }
    },
    [activeId],
  );

  useEffect(() => {
    getMyClubs();
  }, [getMyClubs]);

  const handlePageChange = (event, newPage) => {
    getMyClubs(search, status, newPage + 1);
  };

  if (error) return <ErrorBlock message={error} onRetry={() => getMyClubs()} />;
  const statusList = [
    { label: "Tous", value: "" },
    { label: "En attente", value: 0 },
    { label: "Active", value: 1 },
    { label: "Expirée", value: 2 },
    { label: "Suspendue", value: 3 },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Stack spacing={3}>
        {/* 1. BARRE DE RECHERCHE (HAUT) */}
        <Paper
          sx={{
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un club par nom, ville ou téléphone..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              getMyClubs(value, status);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{icons.search}</InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "action.hover",
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        {/* 2. FLEX : STATUS, ADD, EXPORT */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Filtres de Status */}
          <Stack direction="row" spacing={1}>
            {statusList.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                clickable
                onClick={() => {
                  setStatus(item.value);
                  getMyClubs(search, item.value);
                }}
                sx={{
                  fontWeight: 600,
                  bgcolor: status === item.value ? "primary.main" : "transparent",
                  color:
                    status === item.value
                      ? "primary.contrastText"
                      : "text.primary",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              />
            ))}
          </Stack>

          {/* Actions : Export et Add */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<span>{icons.export}</span>}
              sx={{
                borderColor: "divider",
                color: "text.primary",
                textTransform: "none",
              }}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              startIcon={<span>{icons.add}</span>}
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "primary.dark" },
              }}
              onClick={() => navigate("/dashboard/league/clubs/list")}
            >
              Nouveau Club
            </Button>
          </Stack>
        </Box>

        {/* 3. TABLE DES CLUBS */}
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    color: "text.secondary",
                    fontWeight: 700,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <TableCell>Nom</TableCell>
                <TableCell>VIlle</TableCell>
                <TableCell>Addresse</TableCell>
                <TableCell>Licenciés</TableCell>

                <TableCell>Status(Cotisations)</TableCell>

                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ color: "text.secondary" }}>
                      Chargement des clubs...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : clubs.length > 0 ? (
                clubs.map((club) => (
                  <TableRow
                    key={club.id}
                    hover
                    sx={{
                      "& td": {
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        color: "text.primary",
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          src={club.logo}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: "primary.main",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          }}
                        >
                          {club.name
                            ? club.name.substring(0, 2).toUpperCase()
                            : "??"}
                        </Avatar>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "text.primary",
                              fontSize: "0.85rem",
                              lineHeight: 1.2,
                            }}
                          >
                            {club.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.72rem",
                              display: "block",
                              mt: 0.3,
                            }}
                          >
                            {club.city}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>{club.city}</TableCell>
                    <TableCell>{club.address ?? "Pas d'adresse"}</TableCell>
                    <TableCell>{club.licences_count || 0}</TableCell>

                    <TableCell>
                      {club?.affiliations?.length > 0 ? (
                        club.affiliations.map((affiliation) => {
                          const config = statusList.find(
                            (s) => s.value === affiliation.status,
                          );

                          return (
                            <Chip
                              key={affiliation.id}
                              label={config?.label}
                              size="small"
                              sx={{
                                bgcolor: config?.color,
                                color: config?.text,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                mr: 0.5,
                              }}
                            />
                          );
                        })
                      ) : (
                        <Chip
                          label="Aucune"
                          size="small"
                          sx={{
                            bgcolor: "action.disabledBackground",
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        sx={{ color: "text.secondary" }}
                        onClick={(e) => handleOpenMenu(e, club)}
                      >
                        {icons.more}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ color: "text.secondary" }}>
                      Aucun club disponible
                    </Typography>
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
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
            minWidth: 180,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            "& .MuiMenuItem-root": {
              fontSize: "0.85rem",
              py: 1.2,
              gap: 1.5,
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              },
            },
          },
        }}
      >
        {/* Action : Redirection vers une page dédiée */}
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            navigate(
              `/dashboard/league/affiliations/create?club=${selectedClub?.id}`,
            );
          }}
        >
          <span>📝</span> Affilier le club
        </MenuItem>

        {/* Action : Redirection pour les licences */}
        {/* <MenuItem
          onClick={() => {
            handleCloseMenu();
            navigate(
              `/dashboard/league/licenses/generate?club=${selectedClub?.id}`,
            );
          }}
        >
          <span>🪪</span> Donner licences
        </MenuItem> */}

        <Divider />

        {/* Action : Ouverture d'une Modal pour une action rapide */}
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            // Appeler ici ta fonction pour ouvrir une Modal de confirmation
            alert(`Suspendre le club : ${selectedClub?.name}`);
          }}
          sx={{
            color: "#f44336",
            "&:hover": { bgcolor: "rgba(244,67,54,0.08) !important" },
          }}
        >
          <span>🚫</span> Suspendre
        </MenuItem>
      </Menu>
    </motion.div>
  );
}

export default MesClubs;
