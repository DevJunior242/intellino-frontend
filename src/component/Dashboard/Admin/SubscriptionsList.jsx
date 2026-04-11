import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Divider,
  Stack,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import getStatusColor from "../../../Hook/GetStatusConfig";

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState("");

  const { activeRole, activeClubId } = UseAuth();
  console.log("activeRole:", activeRole);

  const GetSubscriptions = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const response = await Instance(
          `/api/subscriptions?page=${page}&club_id=${activeClubId}`,
        );
        console.log(response);
        const sub = response.data.subscriptions || [];

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
    GetSubscriptions();
  }, [GetSubscriptions]);

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

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );

  return (
    <Box maxWidth="1000px" mx="auto" mt={4}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        Historique des abonnements
      </Typography>

      <Typography textAlign="center" color="text.secondary" mb={3}>
        Liste des abonnements actifs et passés
      </Typography>

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
            count={pagination.last_page}
            page={pagination.current_page}
            onChange={(e, value) => GetSubscriptions(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
