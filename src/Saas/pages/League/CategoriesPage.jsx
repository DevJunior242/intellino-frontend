import React, { useCallback, useEffect, useState } from "react";
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
} from "@mui/material";
import CategoryForm from "./CategoryForm";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import { useNavigate } from "react-router-dom";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const navigate = useNavigate();
  //auh

  //gatcategories
  const getCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get(`/api/categories/categories`);
      console.log(response);
      setCategories(response.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  return (
    <Box sx={{ p: 1 }}>
      {/* Bouton Nouvelle Catégorie */}
      <Button
        variant="outlined"
        sx={{
          mb: 4,
          px: 4,
          py: 1.5,
          color: "#fff",
          borderColor: "rgba(255,255,255,0.3)",
          textTransform: "none",
          borderRadius: 2,
          fontSize: "1rem",
          "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
        }}
        onClick={() => navigate("/dashboard/league/setup")}
      >
        + Nouvelle catégorie
      </Button>

      {/* Conteneur de la Table */}
      <Paper
        sx={{
          bgcolor: "#22262f",
          borderRadius: 4,
          p: 3,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#e8eaf0", mb: 3, fontWeight: 600 }}
        >
          Catégories d'âge
        </Typography>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    color: "#555a6b",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  },
                }}
              >
                <TableCell>Catégorie</TableCell>
                <TableCell>Tranche d'âge</TableCell>
                {/* <TableCell>Disciplines</TableCell> */}
                <TableCell align="right">Licenciés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "& td": {
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      py: 2.5,
                      color: "#c0c4d0",
                    },
                  }}
                >
                  <TableCell
                    sx={{ fontWeight: 600, color: "#e8eaf0 !important" }}
                  >
                    {row.nom}({row.sexe})
                  </TableCell>
                  <TableCell>
                    {row.age_min}-{row.age_max} ans
                  </TableCell>
                  {/* <TableCell>{row.disciplines[0].nom}</TableCell> */}
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 500, color: "red" }}
                  >
                    {row.licencies_count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <CategoryForm open={openModal} handleClose={handleCloseModal} />
      </Paper>
    </Box>
  );
}
