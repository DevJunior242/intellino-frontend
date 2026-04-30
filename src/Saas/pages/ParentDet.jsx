import { useCallback, useEffect, useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Payment } from "@mui/icons-material";
import ConfigSkeleton from "./ConfigSkeleton";

const ParentDet = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFamilyDebt, setTotalFamilyDebt] = useState(0);
  const { activeId } = UseAuth();
  const fetchDebts = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const response = await Instance.get(
        `/api/payments/students/debts?club_id=${activeId}`,
      );
      console.log("debts", response);
      setDebts(response.data.data || []);
      setTotalFamilyDebt(response.data.total_family_debt);
    } catch (error) {
      console.error("Erreur lors de la récupération des débits :", error);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  if (loading) return <ConfigSkeleton />;

  return (
    <Box sx={{ p: 2 }}>
      {/* Résumé global pour le Parent */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          bgcolor: "error.main",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h6">Reste à payer total (Famille)</Typography>
        <Typography variant="h3" fontWeight="900">
          {totalFamilyDebt
            ? parseFloat(totalFamilyDebt).toLocaleString()
            : 0}{" "}
        </Typography>
      </Paper>

      <Typography variant="h6" mb={2} fontWeight="700">
        Détails par enfant
      </Typography>

      <Stack spacing={2}>
        {debts.map((debt) => (
          <Card
            key={debt.id}
            sx={{
              borderRadius: 3,
              borderLeft: "6px solid",
              borderColor: "error.light",
              backgroundColor: "background.default",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {debt.student?.fullname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Forfait : {debt.pricing_plan?.label}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    -{parseFloat(debt.balance).toLocaleString()} F
                  </Typography>
                  <Typography variant="caption">
                    Dernière mise à jour :{" "}
                    {new Date(debt.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Button
        disabled
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 4, borderRadius: 3, py: 2, fontWeight: "bold" }}
        startIcon={<Payment />}
      >
        Payer maintenant (Bientôt disponible)
      </Button>
    </Box>
  );
};
export default ParentDet;
