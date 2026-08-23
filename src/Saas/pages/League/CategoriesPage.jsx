import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import { useNavigate } from "react-router-dom";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";

// 99 est une convention interne pour "senior, pas de plafond d'âge" (le
// règlement n'en fixe pas) — jamais montrer ce chiffre tel quel à l'écran.
function formatTrancheAge(min, max) {
  return max >= 99 ? `${min} ans et +` : `${min}-${max} ans`;
}

// Onglets par discipline — "Kata" regroupe aussi "Kata équipe" (idem Kumite),
// pour ne pas éclater individuel/équipe sur des onglets séparés.
const TABS = [
  { label: "Toutes", match: null },
  { label: "Kata", match: "kata" },
  { label: "Kumite", match: "kumite" },
];

export default function CategoriesPage() {
  const { activeId, activeType } = UseAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  //auh

  //gatcategories
  const getCategories = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await Instance.get(`/api/categories`);
      console.log(response);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.log(error);
      setError(
        "Une erreur est survenue lors de la récupération des catégories",
      );
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId && activeType) getCategories();
  }, [getCategories, activeId, activeType]);

  const filteredCategories = useMemo(() => {
    const { match } = TABS[tab];
    if (!match) return categories;
    return categories.filter((cat) =>
      cat.disciplines?.some((d) => d.toLowerCase().includes(match)),
    );
  }, [categories, tab]);

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error) return <ErrorBlock message={error} onRetry={getCategories} />;

  // Une ligue (affiliée ou non) et une fédération gèrent chacune leurs
  // propres catégories, de façon indépendante — voir CategoryController.
  const canConfigure = activeType === "Federation" || activeType === "Ligue";

  return (
    <Box sx={{ p: 1 }}>
      {canConfigure && (
        <Button
          variant="outlined"
          sx={{
            mb: 4,
            px: 4,
            py: 1.5,
            color: "text.primary",
            borderColor: "divider",
            textTransform: "none",
            borderRadius: 2,
            fontSize: "1rem",
            "&:hover": {
              borderColor: "text.primary",
              bgcolor: "action.hover",
            },
          }}
          onClick={() =>
            navigate(
              activeType === "Federation"
                ? "/dashboard/federation/configCategory"
                : "/dashboard/league/configCategory",
              { replace: true },
            )
          }
        >
          + Nouvelle catégorie
        </Button>
      )}

      {/* Conteneur de la Table */}
      <Paper
        sx={{
          bgcolor: "background.paper",
          borderRadius: 4,
          p: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", mb: 1, fontWeight: 600 }}
        >
          Catégories d'âge
        </Typography>

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ mb: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {TABS.map((t, i) => (
            <Tab key={t.label} label={t.label} value={i} />
          ))}
        </Tabs>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    color: "text.secondary",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  },
                }}
              >
                <TableCell>Catégorie</TableCell>
                <TableCell>Tranche d'âge</TableCell>
                <TableCell>Poids</TableCell>
                <TableCell align="right">Licenciés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", py: 4 }}>
                    Aucune catégorie {TABS[tab].match ? `pour ${TABS[tab].label}` : ""}
                  </TableCell>
                </TableRow>
              )}
              {filteredCategories.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "& td": {
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      py: 2.5,
                      color: "text.secondary",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: (theme) => `${theme.palette.text.primary} !important`,
                    }}
                  >
                    {row.nom}({row.sexe})
                  </TableCell>
                  <TableCell>
                    {formatTrancheAge(row.age_min, row.age_max)}
                  </TableCell>
                  <TableCell>
                    {row.poids_max
                      ? row.poids_min
                        ? `${Number(row.poids_min)}-${Number(row.poids_max)}kg`
                        : `-${Number(row.poids_max)}kg`
                      : row.poids_min
                        ? `+${Number(row.poids_min)}kg`
                        : "—"}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 500, color: "text.primary" }}
                  >
                    {row.licencies_count || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
