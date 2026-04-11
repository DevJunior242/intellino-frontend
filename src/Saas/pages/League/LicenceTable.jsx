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
  Select,
} from "@mui/material";
import { motion } from "framer-motion";
import { Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function LicenceTable() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { auth, activeRole } = UseAuth();
  console.log("auth", auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const leagueId = auth?.user?.current_league_id;
  console.log("leagueId", leagueId);
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
  const getLicences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Instance.get(
        `api/licences/licences?league_id=${leagueId}`,
      );
      console.log(response);
      setPagination({
        total: response.data.total,
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
      });
      setLicences(response.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    getLicences();
  }, [getLicences]);

  const icons = {
    search: <Search />,
    add: "➕",
    export: "📤",
    filter: "⚙️",
    more: "⋮",
  };
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
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
            {/* //select status */}
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value={"Tous"}>Tous</MenuItem>
              <MenuItem value={"Actif"}>Actif</MenuItem>
              <MenuItem value={"Expiré"}>Expiré</MenuItem>
              <MenuItem value={"En attente"}>En attente</MenuItem>
            </Select>
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
              Nouvelle Licence
            </Button>
          </Stack>
        </Box>

        {/* 3. TABLE DES licences */}
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
                <TableCell>Licencié</TableCell>
                <TableCell>N ° de licence</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Validité</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {licences.map((licence) => (
                <TableRow
                  key={licence.id}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      color: "#e8eaf0",
                    },
                  }}
                >
                  <TableCell
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Stack alignItems="center" spacing={2}>
                      {/* Avatar avec gestion Logo ou Initiales */}
                      <Avatar
                        src={licence.logo}
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
                        {licence.student?.fullname
                          ? licence.student.fullname
                              .substring(0, 2)
                              .toUpperCase()
                          : "??"}
                      </Avatar>
                    </Stack>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#e8eaf0",
                          fontSize: "0.85rem",
                        }}
                      >
                        {licence.student?.fullname}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{licence.numero}</TableCell>

                  <TableCell>{licence.club.name}</TableCell>
                  <TableCell>{licence.type}</TableCell>
                  <TableCell>{licence.grade_au_moment}</TableCell>
                  <TableCell>{licence.date_expiration}</TableCell>

                  <TableCell>
                    <Chip
                      label={licence.statut}
                      size="small"
                      sx={{
                        bgcolor:
                          licence.statut === "active"
                            ? "rgba(76,175,80,0.1)"
                            : "rgba(255,152,0,0.1)",
                        color:
                          licence.statut === "active" ? "#4caf50" : "#ff9800",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      sx={{ color: "#8b90a0" }}
                      onClick={(e) => handleOpenMenu(e, licence)}
                    >
                      {icons.more}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
            navigate(`/affiliations/create?club=${selectedClub?.id}`);
          }}
        >
          <span>📝</span> Affilier le club
        </MenuItem>

        {/* Action : Redirection pour les licences */}
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            navigate(`/licenses/generate?club=${selectedClub?.id}`);
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

export default LicenceTable;
