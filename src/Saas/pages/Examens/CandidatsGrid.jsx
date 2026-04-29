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
import ConfigSkeleton from "../ConfigSkeleton";
function CandidatsGrid({ examen }) {
  console.log("examen", examen);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(true);

  const [candidats, setCandidats] = useState([]);
  const [selectCandidat, setSelectCandidat] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalCandidat, setOpenModalCandidat] = useState(false);

  const { activeRole, activeId, activeType, auth } = UseAuth();
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
        `/api/examens/${examen?.id}?organisateur_id=${activeId}`,
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
  }, [examen?.id, activeId]);
  useEffect(() => {
    fetchExamen();
  }, [fetchExamen]);

  if (!candidats) return null;

  //remove
  const handleRemove = async (candidats) => {
    console.log("candidats", candidats);
    if (!window.confirm("Supprimer le candidat ?")) return;
    try {
      const res = await Instance.delete(
        `/api/candidats/remove/${examen?.id}/${candidats}?organisateur_id=${activeId}`,
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
  const isOwner =
    examen?.organisateur_id === activeId &&
    examen?.organisateur_type === activeType;
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

    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      minWidth: 130,
      sortable: false,
      renderCell: (params) => {
        // Un club peut supprimer un candidat UNIQUEMENT si l'examen est encore "ouvert"
        const canRemove = examen?.status === 0;

        return (
          <>
            {isOwner && (
              <IconButton
                size="small"
                onClick={() => handleOpenModal(params.row)}
                title="Saisir les notes"
              >
                <EventNoteIcon color="success" />
              </IconButton>
            )}

            {(isOwner || canRemove) && (
              <IconButton
                size="small"
                onClick={() => handleRemove(params.row.id)}
                title="Retirer le candidat"
              >
                <DeleteIcon color="error" />
              </IconButton>
            )}
          </>
        );
      },
    },
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
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          showToolbar
          localeText={{
            noRowsLabel: "Aucun enregistrement disponible",
            noResultsOverlayLabel: "Aucun résultat trouvé",
          }}
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
        />
      </Box>
      <Box>
        {selectCandidat && (
          <Evaluation
            open={openModal}
            student={selectCandidat}
            handleClose={handleCloseModal}
            examenId={examen?.id}
          />
        )}
        <AddCandidat
          open={openModalCandidat}
          handleClose={handleCloseModalCandidat}
          examenId={examen?.id}
          fetchExamen={fetchExamen}
        />
      </Box>
    </Box>
  );
}

export default CandidatsGrid;
