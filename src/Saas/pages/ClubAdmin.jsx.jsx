import React, { useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import { GridToolbar } from "@mui/x-data-grid/internals";
import { Avatar, Box, Chip, IconButton, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Message from "./Message";
import ConfigSkeleton from "./ConfigSkeleton";
import { useNavigate } from "react-router-dom";

function ClubAdmin() {
  const [error, setError] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const getClubs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await Instance("/api/clubs/clubs");
      console.log("clubs response:", response);
      const formattedClubs = (response.data || []).map((club) => ({
        id: club.id,
        name: club?.name,
        city: club?.city,
        country: club?.country,
        discipline: club?.discipline?.name || "_",
        users_count: club?.users_count || 0,
        logo: club?.logo,
      }));

      setClubs(formattedClubs);
    } catch (error) {
      setError("Une erreur est survenue lors de la récupération des clubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClubs();
  }, []);

  const columns = [
    {
      field: "name",
      headerName: "Nom complet",
      flex: 1,
      editable: true,
      minWidth: 150,
    },

    {
      field: "city",
      headerName: "City",
      flex: 1,
      editable: true,
      minWidth: 150,
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1,
      editable: true,
      minWidth: 150,
    },

    {
      field: "discipline",
      headerName: "Discipline",
      flex: 1,
      editable: true,
      minWidth: 150,
      renderCell: (params) => {
        const value = params.value;
        return (
          <Chip
            label={value || "Aucun discipline"}
            color={"primary"}
            variant="contained"
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },

    {
      field: "users_count",
      headerName: "Users",
      flex: 1,
      editable: true,
      width: 80,
    },
    {
      field: "logo",
      headerName: "Logo",
      flex: 1,
      width: 120,
      editable: true,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Avatar alt={params.row.name} src={params.value} />
        ) : (
          <Avatar>{params.row.name.charAt(0)}</Avatar>
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
            // onClick={() => handleOpenEditModal(params.row)}
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
        Liste des clubs
      </Typography>

      <Box sx={{ height: "70vh", width: "100%", minWidth: 0 }}>
        <DataGrid
          rows={clubs}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(params) => {
            navigate(`/dashboard/members?club_id=${params.row.id}`);
          }}
          //   processRowUpdate={processRowUpdate}
          /// onProcessRowUpdateError={(error) => console.log(error)}
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
    </Box>
  );
}

export default ClubAdmin;
