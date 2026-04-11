import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import { IconButton, Box, Button, CircularProgress } from "@mui/material";
import { UseAuth } from "../../../Api/AuthContext";
import { DataGrid } from "@mui/x-data-grid";
import Evaluation from "./Evaluation";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCandidat from "./AddCandidat";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
function CandidatsGrid({ examenId }) {
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [candidats, setCandidats] = useState([]);
  const [selectCandidat, setSelectCandidat] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalCandidat, setOpenModalCandidat] = useState(false);

  const { activeRole, activeClubId, auth } = UseAuth();
  const isSuperAdmin = auth?.roleSuperAdmin?.includes("super_admin");
  const hasAccessRoles = ["super_admin", "admin_club"];
  const allowAccess = isSuperAdmin || hasAccessRoles.includes(activeRole);

  const handleOpenModal = (candidat) => {
    setSelectCandidat(candidat);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleOpenModalCandidat = () => {
    setOpenModalCandidat(true);
  };
  const handleCloseModalCandidat = () => {
    setOpenModalCandidat(false);
  };

  const fetchExamen = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Instance.get(
        `/api/examens/${examenId}?club_id=${activeClubId}`,
      );
      console.log(res);
      const ArrayCAndidat = res?.data?.candidats || [];
      const process = ArrayCAndidat.map((candidat) => ({
        ...candidat,
        fullname: candidat?.student ? candidat?.student?.fullname : "_",
        birthdate: new Date(
          candidat?.student ? candidat?.student?.birthdate : "_",
        ),
      }));

      setCandidats(process);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [examenId, activeClubId]);
  useEffect(() => {
    fetchExamen();
  }, [fetchExamen]);

  if (loading) return <CircularProgress />;
  if (!candidats) return null;

  //remove
  const handleRemove = async (candidats) => {
    console.log("candidats", candidats);
    if (!window.confirm("Supprimer le candidat ?")) return;
     try {
      const res = await Instance.delete(
        `/api/candidats/remove/${examenId}/${candidats}?club_id=${activeClubId}`,
      );
      console.log(res);
      if (res.data.success) {
        alert("Candidat supprimé avec succès");
        setError({});
        setCandidats((prev) => prev.filter((c) => c.id !== candidats));
      }
    } catch (e) {
      ErrorGlobal({ error: e, setError });
    }
  };

  //update
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

    ...(["admin_club", "instructeur", "secretaire"].includes(activeRole)
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
                  onClick={() => handleOpenModal(params.row)}
                >
                  <EventNoteIcon color="success" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(params.row.id)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <Box>
      {allowAccess && (
        <Button
          variant="contained"
          sx={{
            mt: 2,

            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          onClick={handleOpenModalCandidat}
        >
          Ajouter un candidat
        </Button>
      )}
      <Box
        sx={{
          mt: 2,
          height: 500,
          width: "100%",
          backgroundColor: "background.default",
        }}
      >
        {error?.general && <Message text={error.general} type="error" />}
        <DataGrid
          rows={candidats}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          loading={isLoading}
          checkboxSelection
          disableRowSelectionOnClick
          showToolbar
          localeText={{
            noRowsLabel: "Aucun enregistrement disponible",
            noResultsOverlayLabel: "Aucun résultat trouvé",
          }}
          sx={{
            "& .MuiDataGrid-main": {
              overflowX: "auto",
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
            backgroundColor: "background.default",
            borderRadius: 2,
            boxShadow: 1,
          }}
        />
      </Box>
      <Box>
        {selectCandidat && (
          <Evaluation
            open={openModal}
            student={selectCandidat}
            handleClose={handleCloseModal}
            examenId={examenId}
          />
        )}
        <AddCandidat
          open={openModalCandidat}
          handleClose={handleCloseModalCandidat}
          examenId={examenId}
          fetchExamen={fetchExamen}
          
        />
      </Box>
    </Box>
  );
}

export default CandidatsGrid;
