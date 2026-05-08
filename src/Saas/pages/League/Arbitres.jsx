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
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import AddMemberForm from "../AddMemberForm";
import ToggleRole from "../member/ToggleRole";
import ErrorBlock from "../ErrorBlock";
import MemberLeagueForm from "./MemberLeagueForm";

function Arbitres() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { auth, activeRole, activeId, activeType } = UseAuth();
  const allowAccess = ["admin_league"].includes(activeRole);

  const [openModal, setOpenModal] = useState(false);
  //erreur & ssuccess
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [errorMembers, setErrorMembers] = useState("");

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getMembers = useCallback(async () => {
    setIsLoading(true);
    setErrorMembers("");
    try {
      const response = await Instance(
        `/api/membres/arbitres?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log("membres", response);
      const membersData = response?.data?.members || [];

      setMembers(membersData);
    } catch (error) {
      console.error(error);
      setErrorMembers("Erreur lors de la récupération des membres");
    } finally {
      setIsLoading(false);
    }
  }, [activeId, activeType]);

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
    if (!window.confirm(`retirer ${member.name} de mon club ?`)) return;

    try {
      const response = await Instance.delete(
        `/api/members/${member.id}?club_id=${activeId}`,
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
    // {
    //   field: "role",
    //   headerName: "Role",
    //   flex: 1,
    //   minWidth: 150,

    //   renderCell: (params) => (
    //     <Box sx={{ pl: 1 }}>
    //       <Chip
    //         label={params.value || "non défini"}
    //         size="small"
    //         color={params.value === "admin_club" ? "primary" : "default"}
    //       />
    //     </Box>
    //   ),
    // },

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
            flex: 1,
            minWidth: 130,
            sortable: false,
            renderCell: (params) => {
              const isSelf = params.row.id === auth?.user.id;

              if (isSelf) return null;

              return (
                <>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleOpenEditModal(params.row)}
                    disabled={!isSelf}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteMember(params.row)}
                    disabled={!isSelf}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              );
            },
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
      <Box sx={{ gap: 2, m: 3 }}>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
      </Box>
      {/* loading et members.length ==0*/}

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
        {selectedMember && (
          <ToggleRole
            open={openEditModel}
            handleClose={handleCloseEditModal}
            member={selectedMember}
            setMembers={setMembers}
            activeId={activeId}
            onRefresh={getMembers}
          />
        )}
        <MemberLeagueForm
          open={open}
          handleClose={handleClose}
          getMembers={getMembers}
        />
      </Box>
    </Box>
  );
}

export default Arbitres;
