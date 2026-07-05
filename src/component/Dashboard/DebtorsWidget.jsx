import { useCallback, useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("fr-FR");
}

export default function DebtorsWidget() {
  const navigate = useNavigate();
  const { activeId } = UseAuth();
  const [debtors, setDebtors] = useState([]);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDebtors = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const res = await Instance.get(
        `/api/payments/finance/debts?club_id=${activeId}`,
      );
      setDebtors(res.data?.data?.data || []);
      setTotalUnpaid(res.data?.total_unpaid || 0);
    } catch (error) {
      console.error("Erreur lors de la récupération des impayés :", error);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    fetchDebtors();
  }, [fetchDebtors]);

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        backgroundColor: "background.default",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ fontSize: { xs: 12, sm: 16 } }}
        >
          Élèves en impayé
        </Typography>
        {!loading && debtors.length > 0 && (
          <Chip
            label={`${formatAmount(totalUnpaid)} XOF`}
            color="warning"
            size="small"
          />
        )}
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : debtors.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Aucun impayé pour le moment.
        </Typography>
      ) : (
        <>
          <Divider sx={{ my: 1.5 }} />
          <List dense disablePadding>
            {debtors.slice(0, 5).map((debt) => (
              <ListItem
                key={`${debt.student_id}-${debt.pricing_plan_id}`}
                disableGutters
              >
                <ListItemText
                  primary={debt.student?.fullname || "—"}
                  secondary={debt.pricingPlan?.label}
                />
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="warning.main"
                >
                  {formatAmount(debt.balance)} XOF
                </Typography>
              </ListItem>
            ))}
          </List>
          <Button
            fullWidth
            size="small"
            onClick={() => navigate("/dashboard/dettes")}
            sx={{ mt: 1, textTransform: "none" }}
          >
            Voir tous les impayés
          </Button>
        </>
      )}
    </Paper>
  );
}
