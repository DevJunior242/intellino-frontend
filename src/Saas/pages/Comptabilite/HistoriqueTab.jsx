import {
  Box,
  Paper,
  Typography,
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
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ErrorBlock from "../ErrorBlock";
import ConfigSkeleton from "../ConfigSkeleton";

function HistoriqueTab() {
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
        { responseType: "blob" },
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
        onRetry={() => getPayment()}
      />
    );
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "background.default" }}>
        {loading ? (
          <ConfigSkeleton />
        ) : (
          <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
            <Table stickyHeader aria-label="payments table">
              <TableHead>
                <TableRow>
                  <TableCell>Nom complet</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Forfait</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Période</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paiements.length > 0 ? (
                  paiements.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.student.fullname}</TableCell>
                      <TableCell>
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <b>{p.pricing_plan.label}</b>
                      </TableCell>
                      <TableCell>{p.amount_paid.split(".")[0]} XOF</TableCell>
                      <TableCell>{p.payment_method}</TableCell>
                      <TableCell>
                        Du {new Date(p.starts_at).toLocaleDateString()} <br />
                        au {new Date(p.ends_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
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
                          {downloadingId === p.id ? "Génération..." : "Facture"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
  );
}

export default HistoriqueTab;
