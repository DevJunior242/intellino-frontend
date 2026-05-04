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

  const handleOpenMenu = (event, club) => {
    setAnchorEl(event.currentTarget);
    setSelectedClub(club);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const getMyClubs = useCallback(
    async (searchVal = "", statusVal = "") => {
      if (!activeId) return;

      setLoading(true);
      setError("");

      try {
        const response = await Instance.get(
          `api/leagues/myClubs?organisateur_id=${activeId}&search=${searchVal}&status=${statusVal}`,
        );
        console.log("clubs", response);
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

  if (error) return <ErrorBlock message={error} onRetry={getMyClubs} />;
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
            bgcolor: "#22262f",
            border: "1px solid rgba(255,255,255,0.05)",
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
                bgcolor: "rgba(255,255,255,0.03)",
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
                  bgcolor: status === item.value ? "#e8c84a" : "transparent",
                  color: status === item.value ? "#1a1d23" : "#fff",
                  "&:hover": { bgcolor: "#e8c84a", color: "#1a1d23" },
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
                borderColor: "rgba(255,255,255,0.2)",
                color: "#e8eaf0",
                textTransform: "none",
              }}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              startIcon={<span>{icons.add}</span>}
              sx={{
                bgcolor: "#e8c84a",
                color: "#1a1d23",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#d4b63b" },
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
            bgcolor: "#22262f",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    color: "#555a6b",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  },
                }}
              >
                <TableCell>Nom</TableCell>
                <TableCell>VIlle</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Licenciés</TableCell>

                <TableCell>Status(Cotisations)</TableCell>

                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ color: "#8b90a0" }}>
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
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        color: "#e8eaf0",
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
                            bgcolor: "rgba(232, 200, 74, 0.12)",
                            color: "#e8c84a",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            borderRadius: 2,
                            border: "1px solid rgba(232, 200, 74, 0.2)",
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
                              color: "#e8eaf0",
                              fontSize: "0.85rem",
                              lineHeight: 1.2,
                            }}
                          >
                            {club.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              color: "#8b90a0",
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
                    <TableCell>{club.phone}</TableCell>
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
                            bgcolor: "#444",
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        sx={{ color: "#8b90a0" }}
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
                    <Typography sx={{ color: "#8b90a0" }}>
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
            count={2} // total provenant de data.total
            page={0} // current_page - 1
            rowsPerPage={8}
            onPageChange={() => {}}
            sx={{
              color: "#8b90a0",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          />
        </TableContainer>
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: "#22262f",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e8eaf0",
            minWidth: 180,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            "& .MuiMenuItem-root": {
              fontSize: "0.85rem",
              py: 1.2,
              gap: 1.5,
              "&:hover": { bgcolor: "rgba(232,200,74,0.08)", color: "#e8c84a" },
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
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            navigate(
              `/dashboard/league/licenses/generate?club=${selectedClub?.id}`,
            );
          }}
        >
          <span>🪪</span> Donner licences
        </MenuItem>

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />

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
