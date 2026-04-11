import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";

export default function PostesTable({ data, loading }) {
  // 1. Gestion du chargement
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement du catalogue...</Typography>
      </Box>
    );
  }

  // 2. Gestion de la liste vide (Indispensable pour l'UX)
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          Aucun poste n'a été configuré pour le moment.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Rang</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Intitulé du Poste</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Rattaché à</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((poste) => (
            <TableRow
              key={poste.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>{poste.rang}</TableCell>

              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {/* Si c'est un adjoint, on ajoute l'icône et un décalage */}
                  {poste.parent_id && (
                    <SubdirectoryArrowRightIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary", ml: 2 }}
                    />
                  )}
                  <Typography sx={{ fontWeight: poste.parent_id ? 400 : 600 }}>
                    {poste.title}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={poste.parent_id ? "Adjoint" : "Titulaire"}
                  size="small"
                  variant={poste.parent_id ? "outlined" : "filled"}
                  color={poste.parent_id ? "default" : "primary"}
                />
              </TableCell>

              <TableCell color="text.secondary">
                {poste.parent ? poste.parent.title : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
