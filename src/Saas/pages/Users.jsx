import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

import {
  Avatar,
  Box,
  Chip,
  Typography,
  Button,
  IconButton,
} from "@mui/material";

import { GridToolbar } from "@mui/x-data-grid/internals";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";
import Message from "./Message";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await Instance(`/api/users`);
      console.log("users response:", response);
      setUsers(
        (response.data || []).map((user) => ({
          id: user.id,
          fullname: user?.fullname,
          email: user?.email,
          phone: user?.phone,
          club:
            user.clubs.length > 2
              ? user.clubs
                  .slice(0, 2)
                  .map((c) => c.name)
                  .join(", ") + ` +${user.clubs.length - 2}`
              : user.clubs.map((c) => c.name).join(", "),
        })),
      );
    } catch (error) {
      setError(
        "Une erreur est survenue lors de la récupération des utilisateurs",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setOpenEditModel(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModel(false);
    setSelectedStudent(null);
  };

  //delete
  //   const handleSoftDelete = async (student) => {
  //     if (!window.confirm(`Supprimer ${student.fullname} ?`) || !activeClubId)
  //       return;

  //     try {
  //       const response = await Instance.delete(
  //         `/api/student/${student.id}?club_id=${activeClubId}`,
  //       );

  //       // Retirer la ligne du tableau
  //       setUsers((prev) => prev.filter((s) => s.id !== student.id));
  //       if (response.data.success) {
  //         alert("Élève supprimé avec succès");
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       ErrorGlobal({ error, setError });
  //       alert("Erreur lors de la suppression de l'élève");
  //     }
  //   };

  //columns

  const columns = [
    {
      field: "fullname",
      headerName: "Nom complet",
      flex: 1,
      editable: true,
      minWidth: 150,
    },

    {
      field: "email",
      headerName: "Email",
      flex: 1,
      editable: true,
      minWidth: 150,
    },

    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      editable: true,
      minWidth: 150,
    },
    { field: "club", headerName: "Club", flex: 1, editable: true, width: 80 },
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
          <IconButton size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  if (loading) {
    return <ConfigSkeleton />;
  }
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "background.default",
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", fontSize: { xs: 10, md: 24 } }}
      >
        Liste des users
      </Typography>
      {error && <Message text={error} type="error" />}

      <Box sx={{ height: "70vh", width: "100%", minWidth: 0 }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.id}
          //   processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => console.log(error)}
          pageSizeOptions={[5, 10, 20]}
          loading={loading}
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

      {/* <Box>
        {selectedStudent && (
          <EditStudent
            open={openEditModel}
            handleClose={handleCloseEditModal}
            student={selectedStudent}
          />
        )}
      </Box> */}
    </Box>
  );
}

export default Users;
