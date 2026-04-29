import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Typography,
  Box,
  Button,
  Pagination,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import EquipmentLoanManager from "./EquipmentLoanManager";
import { UseAuth } from "../../Api/AuthContext";

const EquipmentTable = ({
  data,
  onRefresh,
  pagination,
  fetchInventory,
  isLoading,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const handleOpenModal = (equipment) => {
    setSelectedEquipment(equipment);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEquipment(null);
  };

  const { activeId } = UseAuth();
  if (!activeId) return;
  return (
    <Box sx={{ mt: 8, backgroundColor: "background.default" }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          backgroundColor: "background.default",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "primary.light" }}>
            <TableRow>
              <TableCell>
                <strong>Article</strong>
              </TableCell>
              <TableCell>
                <strong>Catégorie</strong>
              </TableCell>
              <TableCell>
                <strong>État du Stock</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Disponibilité</strong>
              </TableCell>
              <TableCell>
                <strong>Statut</strong>
              </TableCell>
              <TableCell>
                <strong>Action</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(2)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton
                      variant="rectangular"
                      height={40}
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((item) => {
                // Calcul du pourcentage de disponibilité
                const availabilityRate =
                  (item.available_quantity / item.total_quantity) * 100;
                const isLowStock =
                  item.available_quantity <= item.min_stock_alert;

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          item.equipment_category?.name || "Sans catégorie"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={availabilityRate}
                            color={isLowStock ? "error" : "success"}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(availabilityRate)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        <strong>{item.available_quantity}</strong> /{" "}
                        {item.total_quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Chip label="Alerte Stock" color="error" size="small" />
                      ) : (
                        <Chip
                          label="Ok"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => handleOpenModal(item)}
                      >
                        Preter
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun équipement enregistré.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => fetchInventory(value)}
            color="primary"
          />
        )}
      </Box>
      <Box>
        {selectedEquipment && (
          <EquipmentLoanManager
            open={openModal}
            handleClose={handleCloseModal}
            equipment={selectedEquipment}
            onRefresh={onRefresh}
            activeId={activeId}
          />
        )}
      </Box>
    </Box>
  );
};

export default EquipmentTable;
