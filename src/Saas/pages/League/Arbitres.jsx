import React, { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Instance } from "../../../Api/Axios";
import {
  Avatar,
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { UseAuth } from "../../../Api/AuthContext";
import { GridToolbar } from "@mui/x-data-grid/internals";
import ErrorBlock from "../ErrorBlock";
import MemberLeagueForm from "./MemberLeagueForm";

function Arbitres() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeRole, activeId, activeType } = UseAuth();
  const allowAccess = ["admin"].includes(activeRole);
  const isFederation = activeType === "Federation";

  // La Ligue et la Fédération ont chacune leur propre contrôleur/table
  // pivot (league_users / federation_users), donc leur propre endpoint —
  // pas un seul endpoint générique.
  const endpointBase = isFederation
    ? "/api/membres/federation-arbitres"
    : "/api/membres/arbitres";

  const [errorMembers, setErrorMembers] = useState("");

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getMembers = useCallback(async () => {
    setIsLoading(true);
    setErrorMembers("");
    try {
      const response = await Instance(
        `${endpointBase}?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      const membersData = response?.data?.members || [];

      setMembers(membersData);
    } catch (error) {
      console.error(error);
      setErrorMembers("Erreur lors de la récupération des membres");
    } finally {
      setIsLoading(false);
    }
  }, [activeId, activeType, endpointBase]);

  useEffect(() => {
    getMembers();
  }, [getMembers]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await Instance.delete(`${endpointBase}/${deleteTarget.id}`);
      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      setErrorMembers(
        error.response?.data?.message || "Erreur lors de la suppression de l'arbitre",
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  //columns

  const columns = [
    {
      field: "name",
      headerName: "Nom complet",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "phone",
      headerName: "Téléphone",
      flex: 1,
      type: "number",
      minWidth: 150,
    },
    {
      field: "photo",
      headerName: "Photo",
      flex: 1,
      width: 120,
      editable: true,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Avatar alt={params?.row?.name} src={params.value} />
        ) : (
          <Avatar>{params?.row?.name.charAt(0)}</Avatar>
        ),
    },
    ...(allowAccess
      ? [
          {
            field: "actions",
            headerName: "Action",
            width: 80,
            sortable: false,
            renderCell: (params) => (
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteTarget(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            ),
          },
        ]
      : []),
  ];

  if (errorMembers)
    return (
      <ErrorBlock
        message="Impossible de charger les membres"
        onRetry={getMembers}
      />
    );
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "background.default",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mt: 10,
          fontWeight: "bold",
          fontSize: { xs: 10, md: 24 },
          color: "#fff",
        }}
      >
        Liste des Arbitres de Compétition
      </Typography>
      {allowAccess && (
        <Button
          variant="contained"
          sx={{
            m: 2,

            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          onClick={handleOpen}
        >
          Ajouter un arbitre
        </Button>
      )}
      <Box sx={{ height: "70vh", width: "100%", minWidth: 0 }}>
        <DataGrid
          rows={members}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10, 20]}
          loading={isLoading}
          checkboxSelection
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{ toolbar: GridToolbar }}
          sx={{
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "background.default",
              borderBottom: "1px solid",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              fontSize: { xs: 8, md: 16 },
            },
            "&.MuiDataGrid-root .MuiDataGrid-cell": {
              fontSize: { xs: 8, md: 16 },
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
              cursor: "pointer",
            },
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "rgba(255, 255, 255, 0.05) !important",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1) !important",
              },
            },
            backgroundColor: "background.default",
            borderRadius: 2,
            boxShadow: 1,
          }}
          showToolbar
          localeText={{
            noRowsLabel: "Aucun enregistrement disponible",
            noResultsOverlayLabel: "Aucun résultat trouvé",
          }}
        />
      </Box>

      <Box>
        <MemberLeagueForm
          open={open}
          handleClose={handleClose}
          getMembers={getMembers}
        />
      </Box>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Retirer cet arbitre ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{deleteTarget?.name}</strong> ne sera plus arbitre de{" "}
            {isFederation ? "cette fédération" : "cette ligue"}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none" }}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Suppression..." : "Retirer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Arbitres;
