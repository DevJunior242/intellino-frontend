import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Button,
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ErrorBlock from "./ErrorBlock";
import ConfigSkeleton from "./ConfigSkeleton";

function PaymentIndex() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const { activeId } = UseAuth();
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const getPayment = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const response = await Instance.get(
          `/api/payments?page=${page}&club_id=${activeId}`,
        );
        console.log(response);
        const payment = response.data.paiements || [];
        setPaiements(payment?.data || []);
        setPagination({
          currentPage: payment.current_page,
          lastPage: payment.last_page,
          perPage: payment.per_page,
          total: payment.total,
        });
      } catch (error) {
        setError("Erreur lors de la récupération des payments :");
        console.error("Erreur lors de la récupération des payments :", error);
      } finally {
        setLoading(false);
      }
    },
    [activeId],
  );

  useEffect(() => {
    getPayment();
  }, [getPayment]);

  const downloadInvoice = async (paymentId) => {
    setDownloadingId(paymentId);
    try {
      const res = await Instance.get(
        `/api/payments/${paymentId}/downloadInvoice?club_id=${activeId}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Facture-${paymentId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les paiements"
        onRetry={getPayment}
      />
    );
  return (
    <Box>
      <Box sx={{ backgroundColor: "background.default" }}>
        <Paper
          elevation={3}
          sx={{ p: 2, backgroundColor: "background.default" }}
        >
          <Typography
            variant="h5"
            component="h2"
            fontWeight={"bold"}
            gutterBottom
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: { xs: 8, md: 14 },
            }}
          >
            Liste de suivi des Paiements
          </Typography>

          {loading ? (
            <ConfigSkeleton />
          ) : (
            <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
              <Table stickyHeader aria-label="payments table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Nom complet
                    </TableCell>
                    {/* <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Naissance
                    </TableCell> */}
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Forfait
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Montant
                    </TableCell>

                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Mode
                    </TableCell>

                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Période
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paiements.length > 0 ? (
                    paiements.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                          {p.student.fullname}
                        </TableCell>
                        {/* <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                          {p.student.birthdate}
                        </TableCell> */}
                        <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                          {new Date(p.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                          <b>{p.pricing_plan.label}</b>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                          {p.amount_paid.split(".")[0]} XOF
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                          {p.payment_method}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: 8, md: 16 } }}>
                          Du {new Date(p.starts_at).toLocaleDateString()} <br />
                          au {new Date(p.ends_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: 8, md: 16 } }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={downloadingId === p.id}
                            startIcon={
                              downloadingId === p.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <PictureAsPdfIcon sx={{ color: "red" }} />
                              )
                            }
                            onClick={() => downloadInvoice(p.id)}
                          >
                            {downloadingId === p.id
                              ? "Génération..."
                              : "Facture"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{ fontSize: { xs: 8, md: 16 } }}
                      >
                        Vous n'avez aucun paiement disponible pour le moment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {pagination.lastPage > 1 && (
              <Pagination
                count={pagination.lastPage}
                page={pagination.currentPage}
                onChange={(e, value) => getPayment(value)}
                color="primary"
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default PaymentIndex;
