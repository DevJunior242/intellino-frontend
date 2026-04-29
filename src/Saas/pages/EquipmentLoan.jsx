import React, { useCallback, useEffect, useState } from "react";
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
} from "@mui/material";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";
import EquipmentAction from "./EquipmentAction";

const EquipmentLoan = () => {
  const { activeId } = UseAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [pagination, setPagination] = useState({});

  const [openEditModel, setOpenEditModel] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  //getPret
  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await Instance.get(
          `/api/inventory/prets?page=${page}&club_id=${activeId}`,
        );
        console.log(res);
        const equipments = res.data.equipments || [];
        setData(equipments.data || []);
        setPagination({
          currentPage: equipments.current_page,
          lastPage: equipments.last_page,
          perPage: equipments.per_page,
          total: equipments.total,
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des equipements :",
          error,
        );
      } finally {
        setLoading(false);
      }
    },
    [activeId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEditModal = (equipment) => {
    setSelectedEquipment(equipment);
    setOpenEditModel(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModel(false);
    setSelectedEquipment(null);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 0, backgroundColor: "background.default" }}>
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
                <strong>Club</strong>
              </TableCell>
              <TableCell>
                <strong>Matériel</strong>
              </TableCell>

              <TableCell>
                <strong>Quantité</strong>
              </TableCell>
              <TableCell>
                <strong>Remis</strong>
              </TableCell>
              <TableCell>
                <strong>Perdu</strong>
              </TableCell>
              <TableCell>
                <strong>Détruit</strong>
              </TableCell>

              <TableCell>
                <strong>Emprunté le </strong>
              </TableCell>
              <TableCell>
                <strong>Retourné le </strong>
              </TableCell>
              <TableCell>
                <strong>Status </strong>
              </TableCell>
              <TableCell>
                <strong>Action</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => {
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.to_club?.name || "interne"}</TableCell>
                    <TableCell>{item.equipment?.name}</TableCell>

                    <TableCell>{item.quantity_loaned}</TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      {item.quantity_returned}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      {item.quantity_lost}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      {item.quantity_damaged}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(item.loaned_at).toISOString().split("T")[0]}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.returned_at
                          ? new Date(item.returned_at)
                              .toISOString()
                              .split("T")[0]
                          : "Non"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      {item.status}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditModal(item)}
                      >
                        remise
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                Aucun équipement enregistré.
              </Typography>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => fetchData(value)}
            color="primary"
          />
        )}
      </Box>

      <Box>
        {selectedEquipment && (
          <EquipmentAction
            open={openEditModel}
            handleClose={handleCloseEditModal}
            data={selectedEquipment}
            setData={setData}
          />
        )}
      </Box>
    </Box>
  );
};

export default EquipmentLoan;
