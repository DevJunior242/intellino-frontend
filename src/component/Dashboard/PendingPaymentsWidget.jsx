import React, { useCallback, useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Instance } from "../../Api/Axios";

function sumPending(lots) {
  return lots
    .filter((lot) => lot.status !== "paid")
    .reduce((total, lot) => total + Number(lot.amount || 0), 0);
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("fr-FR");
}

export default function PendingPaymentsWidget() {
  const navigate = useNavigate();
  const [stagesDue, setStagesDue] = useState(0);
  const [licencesDue, setLicencesDue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLots = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await Instance.get("/api/transactions/mes-lots");
      const lots = data?.data || [];
      setStagesDue(sumPending(lots.filter((l) => l.payable_type === "stage")));
      setLicencesDue(
        sumPending(lots.filter((l) => l.payable_type === "licence_lot")),
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements en attente :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const total = stagesDue + licencesDue;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        backgroundColor: "background.default",
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: 12, sm: 16 } }}>
        Paiements en attente (stages & licences)
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : total === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Rien à régler pour le moment.
        </Typography>
      ) : (
        <>
          <Typography variant="h4" fontWeight={900} sx={{ my: 1 }}>
            {formatAmount(total)} XOF
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Stages : {formatAmount(stagesDue)} XOF
              </Typography>
              <Button
                size="small"
                onClick={() => navigate("/dashboard/stages/ma-ligue")}
                sx={{ textTransform: "none" }}
              >
                Régler
              </Button>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Licences : {formatAmount(licencesDue)} XOF
              </Typography>
              <Button
                size="small"
                onClick={() => navigate("/dashboard/licences")}
                sx={{ textTransform: "none" }}
              >
                Régler
              </Button>
            </Stack>
          </Stack>
        </>
      )}
    </Paper>
  );
}
