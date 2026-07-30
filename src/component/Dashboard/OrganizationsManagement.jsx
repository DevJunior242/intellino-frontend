import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";
import ErrorBlock from "../../Saas/pages/ErrorBlock";

const TABS = [
  { key: "clubs", type: "club", label: "Clubs", locationField: "city" },
  { key: "leagues", type: "league", label: "Ligues", locationField: "region" },
  { key: "federations", type: "federation", label: "Fédérations", locationField: "code" },
];

export default function OrganizationsManagement() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ clubs: [], leagues: [], federations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await Instance.get("/api/super-admin/organizations");
      setData(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger les organisations.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleToggle = async (type, org) => {
    setTogglingId(org.id);
    try {
      const { data: res } = await Instance.patch(
        `/api/super-admin/organizations/${type}/${org.id}/toggle-status`,
      );
      setToast({ open: true, message: res.message, severity: "success" });
      fetchOverview();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur.",
        severity: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <ConfigSkeleton />;
  if (error) return <ErrorBlock message={error} onRetry={fetchOverview} />;

  const current = TABS[tab];
  const rows = data[current.key] || [];

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        mx: 1,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Organisations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Active ou désactive n'importe quel club, ligue ou fédération. Une
        organisation désactivée devient inaccessible à ses membres.
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        {TABS.map((t) => (
          <Tab key={t.key} label={`${t.label} (${data[t.key]?.length || 0})`} />
        ))}
      </Tabs>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>{current.label === "Fédérations" ? "Code" : "Localisation"}</TableCell>
              <TableCell align="center">Membres</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucune organisation trouvée.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((org) => {
              const active = Number(org.status) === 1;
              return (
                <TableRow key={org.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{org.name}</TableCell>
                  <TableCell>{org[current.locationField] || "—"}</TableCell>
                  <TableCell align="center">{org.users_count ?? 0}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={active ? "Actif" : "Désactivé"}
                      size="small"
                      color={active ? "success" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={active}
                      disabled={togglingId === org.id}
                      onChange={() => handleToggle(current.type, org)}
                      color="success"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
