import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Paper,
  TableContainer,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
} from "@mui/material";
import { UseAuth } from "../../Api/AuthContext";
import getStatusColor from "../../Hook/GetStatusConfig";

function AbonnementActif() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { activeClubId } = UseAuth();
  console.log("activeClubId:", activeClubId);
  const GetActifAbon = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError("");
      try {
        const response = await Instance(
          `/api/subscriptions/show?page=${page}&club_id=${activeClubId}`,
        );
        console.log(response);
        const sub = response.data.active_subscriptions || [];

        const subArray = sub.data ? sub.data : sub;
        setSubscriptions(subArray);
        setPagination({
          currentPage: sub.current_page,
          lastPage: sub.last_page,
          perPage: sub.per_page,
          total: sub.total,
        });
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [activeClubId],
  );

  useEffect(() => {
    GetActifAbon();
  }, [GetActifAbon]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ mt: 5, px: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ fontSize: { xs: 18, md: 24 } }}
        >
          Abonnements actifs
        </Typography>

        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard/subscription")}
          sx={{ textTransform: "none", fontSize: { xs: 12, md: 16 } }}
        >
          Voir l’historique
        </Button>
      </Box>

      {error && (
        <Typography color="error" textAlign="center" mb={2}>
          {error}
        </Typography>
      )}

      {!subscriptions.length && !error && (
        <Typography textAlign="center" color="text.secondary">
          Aucun abonnement actif trouvé.
        </Typography>
      )}

      {subscriptions.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: "background.default",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "primary.light" }}>
              <TableRow>
                <TableCell>Club</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Début</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id} hover>
                  <TableCell>{sub?.club?.name ?? "Club inconnu"}</TableCell>
                  <TableCell>{sub?.plan?.name ?? "-"}</TableCell>
                  <TableCell>{sub?.start_date ?? "-"}</TableCell>
                  <TableCell>{sub?.end_date ?? "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={sub.status}
                      color={getStatusColor(sub.status) ?? "default"}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pagination.lastPage > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => GetActifAbon(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}

export default AbonnementActif;
