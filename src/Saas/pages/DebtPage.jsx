import { WhatsApp, Phone, Payment } from "@mui/icons-material";
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
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../Api/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfigSkeleton from "./ConfigSkeleton";

const DebtPage = () => {
  const [debts, setDebts] = useState([]);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const { activeClubId } = UseAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchDebts = useCallback(async () => {
    if (!activeClubId) return;
    setLoading(true);
    try {
      const response = await Instance.get(
        `/api/payments/finance/debts?club_id=${activeClubId}`,
      );
      console.log("Debts response:", response);
      setDebts(response.data.data || []);
      setTotalUnpaid(response.data.total_unpaid);
    } catch (error) {
      console.error("Erreur lors de la récupération des débits :", error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    if (!activeClubId) return;
    fetchDebts();
  }, [activeClubId, fetchDebts]);

  const sendWhatsApp = (student, amount) => {
    const message = `Bonjour, le club vous informe que le reliquat pour ${student.first_name} est de ${amount} F. Merci de passer régulariser.`;
    window.open(
      `https://wa.me/${student.phone_parent}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleSolder = (debt) => {
    navigate("payment/store", {
      state: {
        prefill: {
          student: debt.student,
          pricing_plan_id: debt.pricing_plan_id,
          amount_remaining: debt.balance,
        },
      },
    });
  };
  return (
    <Box sx={{ p: 2, backgroundColor: "background.default" }}>
      <Typography variant="h4" fontWeight="800">
        Gestion des Recouvrements
      </Typography>

      {/* Résumé de la dette totale du club */}
      <Alert severity="warning" sx={{ my: 3, borderRadius: 3 }}>
        <Typography variant="h6">
          Total à recouvrer :{" "}
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
          <TableHead sx={{ bgcolor: "blue" }}>
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
                    {debt.student?.fullname}
                  </Typography>
                  <Typography variant="caption">
                    {debt.student.phone_parent}
                  </Typography>
                </TableCell>
                <TableCell>{debt.pricing_plan.label}</TableCell>
                <TableCell>
                  {parseFloat(debt.total_amount).toLocaleString()} F
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${parseFloat(debt.balance).toLocaleString()} F`}
                    color="error"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      color="success"
                      onClick={() => sendWhatsApp(debt.student, debt.balance)}
                    >
                      <WhatsApp />
                    </IconButton>
                    {/* <IconButton
                      color="primary"
                      href={`tel:${debt.student.phone_parent}`}
                    >
                      <Phone />
                    </IconButton> */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Payment />}
                      onClick={() => handleSolder(debt)}
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
    </Box>
  );
};
export default DebtPage;
