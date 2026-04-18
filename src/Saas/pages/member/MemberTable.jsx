import React, { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Instance } from "../../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import {
  Avatar,
  Box,
  Chip,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Button,
  DialogTitle,
  DialogActions,
} from "@mui/material";

import { UseAuth } from "../../../Api/AuthContext";
import { GridToolbar } from "@mui/x-data-grid/internals";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleRole from "./ToggleRole";
import AddMemberForm from "../AddMemberForm";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";
import { useSearchParams } from "react-router-dom";
function MemberTable() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { auth, activeRole, activeClubId } = UseAuth();
  const allowAccess = ["admin_club"].includes(activeRole);

  const [openModal, setOpenModal] = useState(false);
  //erreur & ssuccess
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [errorMembers, setErrorMembers] = useState("");

  //

  const [params] = useSearchParams();
  const clubIdFromUrl = params.get("club_id");
  const clubId = activeRole === "super_admin" ? clubIdFromUrl : activeClubId;
  const getMembers = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setErrorMembers("");
      try {
        const response = await Instance(
          `/api/members?page=${page}&club_id=${clubId}`,
        );
        console.log(response);
        const membersData = response?.data?.members ?? { data: [] };

        setMembers(membersData.data ?? []);
      } catch (error) {
        console.error(error);
        setErrorMembers("Erreur lors de la récupération des membres");
      } finally {
        setIsLoading(false);
      }
    },
    [activeClubId],
  );

  useEffect(() => {
    getMembers();
  }, [getMembers]);

  const handleOpenEditModal = (member) => {
    setSelectedMember(member);
    setOpenEditModel(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModel(false);
    setSelectedMember(null);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  //delete
  const handleDeleteMember = async (member) => {
    setError({});
    setSuccess("");
    if (!window.confirm(`retirer ${member.fullname} de mon club ?`)) return;

    try {
      const response = await Instance.delete(
        `/api/members/${member.id}?club_id=${activeClubId}`,
      );

      // Retirer la ligne du tableau
      setMembers((prev) => prev.filter((s) => s.id !== member.id));
      if (response.data.success) {
        alert("membre supprimé avec succès");
      }
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    }
  };

  //columns

  const columns = [
    {
      field: "fullname",
      headerName: "Nom complet",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "phone",
      headerName: "Téléphone",
      flex: 1,
      type: "number",
      minWidth: 150,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 150,

      renderCell: (params) => (
        <Box sx={{ pl: 1 }}>
          <Chip
            label={params.value || "non défini"}
            size="small"
            color={params.value === "admin_club" ? "primary" : "default"}
          />
        </Box>
      ),
    },

    ...(auth?.roleSuperAdmin.includes("super_admin")
      ? [
          {
            field: "club",
            headerName: "Club",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
              //deffin un color pour le club
              const value = params.value;
              return (
                <Chip
                  label={value || "Aucun club"}
                  color={"primary"}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              );
            },
          },
        ]
      : []),

    {
      field: "photo",
      headerName: "Photo",
      flex: 1,
      width: 120,
      editable: true,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Avatar alt={params.row.fullname} src={params.value} />
        ) : (
          <Avatar>{params.row.fullname.charAt(0)}</Avatar>
        ),
    },
    ...(allowAccess
      ? [
          {
            field: "actions",
            headerName: "Action",
            flex: 1,
            minWidth: 130,
            sortable: false,
            renderCell: (params) => (
              <>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleOpenEditModal(params.row)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteMember(params.row)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
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
        sx={{ mt: 10, fontWeight: "bold", fontSize: { xs: 10, md: 24 } }}
      >
        Liste des membres
      </Typography>
      <Box sx={{ gap: 2, m: 3 }}>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
      </Box>
      {/* loading et members.length ==0*/}
      {isLoading && members.length === 0 && <ConfigSkeleton />}

      {allowAccess && (
        <Button
          variant="contained"
          sx={{
            mt: 2,

            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          onClick={handleOpenModal}
        >
          Ajouter un membre
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
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              fontSize: { xs: 8, md: 16 },
            },
            "&.MuiDataGrid-root .MuiDataGrid-cell": {
              fontSize: { xs: 8, md: 16 },
              display: "flex",
              alignItems: "center",
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
        {selectedMember && (
          <ToggleRole
            open={openEditModel}
            handleClose={handleCloseEditModal}
            member={selectedMember}
            setMembers={setMembers}
            activeClubId={activeClubId}
            onRefresh={getMembers}
          />
        )}

        <Dialog
          maxWidth="md"
          open={openModal}
          onClose={handleCloseModal}
          sx={{
            "& .MuiDialog-paper": {
              p: 3,
              borderRadius: 3,
              backgroundColor: "background.default",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Formulaire de création de membre
          </DialogTitle>
          <DialogContent>
            <AddMemberForm onRefresh={getMembers} />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "flex-end" }}>
            <Button onClick={handleCloseModal} color="error">
              Annuler
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default MemberTable;
