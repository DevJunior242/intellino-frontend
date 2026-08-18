import { WhatsApp, Payment } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Chip,
  Button,
  Pagination,
} from "@mui/material";
import { Instance } from "../../../Api/Axios";
import { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";

const DettesTab = ({ onSolder }) => {
  const [debts, setDebts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const { activeId } = UseAuth();
  const [loading, setLoading] = useState(true);
  const [errorDebts, setErrorDebts] = useState("");

  const fetchDebts = useCallback(
    async (page = 1) => {
      if (!activeId) return;
      setLoading(true);
      setErrorDebts("");
      try {
        const response = await Instance.get(
          `/api/payments/finance/debts?club_id=${activeId}&page=${page}`,
        );
        const debts = response.data.data;
        setDebts(debts.data || []);
        setPagination({
          currentPage: debts.current_page,
          lastPage: debts.last_page,
          perPage: debts.per_page,
          total: debts.total,
        });
        setTotalUnpaid(response.data.total_unpaid || 0);
      } catch (error) {
        setErrorDebts("Erreur réseau.veuillez réessayer");
        console.error("Erreur lors de la récupération des débits :", error);
      } finally {
        setLoading(false);
      }
    },
    [activeId],
  );

  useEffect(() => {
    if (!activeId) return;
    fetchDebts();
  }, [activeId, fetchDebts]);

  const sendWhatsApp = (student, amount) => {
    const message = `Bonjour, ${student?.club?.name} vous informe que le reliquat pour ${student.fullname} est de ${amount} F. Merci de passer régulariser.`;
    window.open(
      `https://wa.me/${student.parents[0]?.user?.phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  if (errorDebts)
    return (
      <ErrorBlock
        message="Impossible de charger les débits"
        onRetry={() => fetchDebts()}
      />
    );
  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
        <Typography variant="h6">
          Total à recouvrer : &nbsp;
          <strong>
            {totalUnpaid ? parseFloat(totalUnpaid).toLocaleString() : 0}
          </strong>{" "}
          F
        </Typography>
      </Alert>
      {loading && <ConfigSkeleton />}
      {!loading && debts.length === 0 && (
        <Typography
          sx={{
            fontSize: 12,
            color: "text.disabled",
            textAlign: "center",
            py: 2,
          }}
        >
          Aucun débit à payer
        </Typography>
      )}

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, backgroundColor: "background.default" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Élève</TableCell>
              <TableCell>Forfait</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Reste à Payer</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.map((debt, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography fontWeight="bold">
                    {debt?.student?.fullname}
                  </Typography>
                </TableCell>
                <TableCell>{debt?.pricing_plan?.label}</TableCell>
                <TableCell>
                  {parseFloat(debt?.total_amount).toLocaleString()} F
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${parseFloat(debt?.balance).toLocaleString()} F`}
                    color="error"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      color="success"
                      onClick={() => sendWhatsApp(debt?.student, debt?.balance)}
                    >
                      <WhatsApp />
                    </IconButton>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Payment />}
                      onClick={() => onSolder(debt)}
                    >
                      SOLDER
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => fetchDebts(value)}
            color="primary"
          />
        )}
      </Box>
    </Box>
  );
};
export default DettesTab;
