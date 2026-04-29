import React, { useCallback, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Instance } from "../../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import {
  Avatar,
  Box,
  Chip,
  Typography,
  Button,
  IconButton,
} from "@mui/material";

import { UseAuth } from "../../../Api/AuthContext";
import { GridToolbar } from "@mui/x-data-grid/internals";
import EditIcon from "@mui/icons-material/Edit";
import EditStudent from "../EditStudent";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorGlobal from "../../../component/ErrorGlobal";
import ConfigSkeleton from "../ConfigSkeleton";
import Message from "../Message";
import ErrorBlock from "../ErrorBlock";
function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { auth, activeId } = UseAuth();
  const [errorStudent, setErrorStudent] = useState("");
  const { error, setError } = useState({});

  //

  const getStudents = useCallback(async () => {
    setLoading(true);
    setErrorStudent("");
    try {
      const response = await Instance(`/api/students?club_id=${activeId}`);
      console.log("students", response);
      setStudents(
        (response.data.students || []).map((student) => ({
          id: student.id,
          fullname: student?.fullname,
          birthdate: new Date(student?.birthdate),

          sex: student?.sex,
          status: student?.status,
          photo: student?.photo,
          clubName: student?.club ? student?.club?.name : "_",
        })),
      );
    } catch (error) {
      console.error(error);
      setErrorStudent("Erreur lors de la récupération des étudiants");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    getStudents();
  }, [getStudents]);
  //retry
  const retryStudents = useCallback(async () => {
    setErrorStudent("");
    try {
      const res = await Instance.get("/api/students");
      setStudents(res.data.data || []);
    } catch (err) {
      setErrorStudent("Erreur réseau.veuillez réessayer");
    }
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
  const handleSoftDelete = async (student) => {
    if (!window.confirm(`Supprimer ${student.fullname} ?`) || !activeId) return;

    try {
      const response = await Instance.delete(
        `/api/student/${student.id}?club_id=${activeId}`,
      );

      // Retirer la ligne du tableau
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      if (response.data.success) {
        alert("Élève supprimé avec succès");
      }
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
      alert("Erreur lors de la suppression de l'élève");
    }
  };

  const statusConfig = {
    0: { color: "primary", label: "actif" }, // STATUS_ACTIV
    2: { color: "success", label: "Inactif" }, // STATUS_INACTIV
  };
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
      field: "birthdate",
      headerName: "Date de naissance",
      flex: 1,
      editable: true,
      type: "date",
      minWidth: 130,
    },
    { field: "sex", headerName: "Sexe", flex: 1, editable: true, width: 80 },
    ...(auth?.roleSuperAdmin.includes("super_admin")
      ? [
          {
            field: "clubName",
            headerName: "Club",
            flex: 1,
            editable: true,
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
      field: "status",
      headerName: "Statut",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const value = params.value;
        return (
          <Chip
            label={statusConfig[value]?.label}
            color={statusConfig[value]?.color}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
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
          <IconButton
            size="small"
            color="error"
            onClick={() => handleSoftDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  //mettre à jour les étudiants
  const processRowUpdate = async (newRow, oldRow) => {
    try {
      const payload = {
        ...newRow,
        birthdate: newRow.birthdate
          ? newRow.birthdate.toISOString().split("T")[0]
          : null,
        status: newRow.status ? newRow.status : null,
        sex: newRow.sex ? newRow.sex : null,
        fullname: newRow.fullname ? newRow.fullname : null,
      };
      if (!(newRow.photo instanceof File)) {
        delete payload.photo;
      }
      const response = await Instance.post(
        `/api/student/${oldRow.id}`,
        payload,
      );
      console.log(response);
      const updatedStudent = response?.data?.student || [];
      const formatedStudent = {
        ...oldRow,
        ...updatedStudent,
        id: updatedStudent.id,
        fullname: updatedStudent?.fullname,
        birthdate: new Date(updatedStudent?.birthdate),

        sex: updatedStudent?.sex,
        status: updatedStudent?.status,
        photo: updatedStudent?.photo ? updatedStudent?.photo : oldRow.photo,
        clubName: updatedStudent?.club ? updatedStudent?.club?.name : "_",
      };
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === formatedStudent.id ? formatedStudent : student,
        ),
      );
      return formatedStudent;
    } catch (error) {
      console.error(error);
      return oldRow;
    }
  };
  // if (loading) {
  //   return <ConfigSkeleton />;
  // }

  if (errorStudent)
    return (
      <ErrorBlock
        message="Impossible de charger les étudiants"
        onRetry={retryStudents}
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
        Liste des étudiants
      </Typography>
      {error && <Message text={error} type="error" />}

      <Box sx={{ height: "70vh", width: "100%", minWidth: 0 }}>
        <DataGrid
          rows={students}
          columns={columns}
          getRowId={(row) => row.id}
          processRowUpdate={processRowUpdate}
          pageSizeOptions={[5, 10, 20]}
          loading={loading}
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
        {selectedStudent && (
          <EditStudent
            open={openEditModel}
            handleClose={handleCloseEditModal}
            student={selectedStudent}
            setStudents={setStudents}
          />
        )}
      </Box>
    </Box>
  );
}

export default StudentList;
