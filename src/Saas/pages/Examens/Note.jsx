import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import {
  Box,
  CircularProgress,
  Button,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import EditNote from "./EditNote";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfigSkeleton from "../ConfigSkeleton";
function Note() {
  const [loading, setLoading] = useState(true);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [students, setStudents] = useState([]);
  const [examen, setExamen] = useState({});
  const [selectCandidat, setSelectCandidat] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [totalPointsPossibles, setTotalPointsPossibles] = useState(0);

  const { examenId } = useParams();
  const { activeId, activeType } = UseAuth();
  const isOwner =
    examen.organisateur_id === activeId &&
    examen.organisateur_type === activeType;

  const getNotes = useCallback(async () => {
    if (!examenId) {
      console.error("examenId est undefined !");
      return;
    }
    setLoading(true);
    try {
      const response = await Instance(
        `/api/evaluation/${examenId}?organisateur_id=${activeId}`,
      );
      console.log(response);
      const examenData = response?.data || {};
      setExamen(examenData.exam || {});
      setTotalPointsPossibles(examenData.total_points_possibles);

      setStudents(examenData?.students || []);
      const formattedStudents = (examenData?.students || []).map((student) => ({
        ...student,
        fullname: student.fullname,
        birthdate: student.birthdate,
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeId, examenId]);

  useEffect(() => {
    getNotes();
  }, [getNotes]);

  const downloadNote = async (studentId) => {
    setDownloadingId(studentId);
    try {
      const res = await Instance.get(
        `/api/examens/${examenId}/notes/pdf?student_id=${studentId}&organisateur_id=${activeId}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Facture-${studentId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenEditModal = (candidat) => {
    setSelectCandidat(candidat);
    setOpenEditModel(true);
  };
  const handleCloseModal = () => {
    setOpenEditModel(false);
    setSelectCandidat(null);
  };
  const generateLocalPDF = (studentRow) => {
    const originalStudent = students.find((s) => s.id === studentRow.id);
    if (!originalStudent) return;

    const doc = new jsPDF();

    // --- EN-TÊTE ---
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text("BULLETIN DE NOTES - EXAMEN DE GRADE", 105, 15, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gris
    doc.text(`Grade visé : ${examen.grade || "N/A"}`, 20, 25);
    doc.text(`Session : ${examen.start_date} au ${examen.end_date}`, 20, 30);
    doc.text(`Édité le : ${new Date().toLocaleDateString()}`, 155, 25);

    // --- INFOS CANDIDAT ---
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0); // Noir
    doc.text(`NOM COMPLET : ${originalStudent.fullname.toUpperCase()}`, 20, 45);
    doc.setFont(undefined, "normal");
    doc.text(`Date de naissance : ${originalStudent.birthdate}`, 20, 50);
    doc.text(`Rang au classement : ${originalStudent.rang}`, 155, 45);

    // --- TABLEAU DES NOTES ---
    const tableColumn = ["Discipline / Enchaînement", "Note", "Coef", "Total"];
    const tableRows = originalStudent.notes.map((n) => [
      n.label,
      n.value,
      "1",
      n.value,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [30, 58, 138],
        halign: "center",
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center", fontStyle: "bold" },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 12;

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(
      `MOYENNE GÉNÉRALE : ${originalStudent.moyenne} / ${totalPointsPossibles}`,
      20,
      finalY,
    );

    // Correction ici pour la couleur de décision
    const isPass =
      originalStudent.passage === "Passable" ||
      originalStudent.passage === "Admis";
    if (isPass) {
      doc.setTextColor(0, 128, 0); // Vert
    } else {
      doc.setTextColor(220, 38, 38); // Rouge
    }
    doc.text(
      `DÉCISION DU JURY : ${originalStudent.passage || "En attente"}`,
      20,
      finalY + 8,
    );

    // --- SIGNATURE ---
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    doc.text("Le Président du Jury", 140, finalY + 25, { align: "center" });

    doc.save(`Bulletin_${originalStudent.fullname.replace(/\s+/g, "_")}.pdf`);
  };
  const columns = useMemo(() => {
    if (!students.length) return [];
    const baseColumns = [
      { field: "fullname", headerName: "Nom complet", width: 150 },

      { field: "birthdate", headerName: "Date de naissance", width: 150 },
    ];

    let allColumns = [...baseColumns];
    if (students.length > 0) {
      const noteColumns = students[0].notes.map((n) => ({
        field: n.key,
        headerName: n.label,
        width: 120,
      }));

      allColumns = [...allColumns, ...noteColumns];
    }
    const completedClomuns = [
      { field: "moyenne", headerName: "M/G/100", width: 150 },
      { field: "rang", headerName: "Rang", width: 150 },
      {
        field: "passage",
        headerName: "Decision Jury",
        width: 150,
        renderCell: (params) => {
          const value = params.value;
          return (
            <Chip
              label={value ? value : "En attente"}
              color={value === "Passable" ? "success" : "error"}
              size="small"
              sx={{ textTransform: "capitalize" }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Action",
        flex: 1,
        minWidth: 130,
        sortable: false,
        renderCell: (params) => {
          return (
            <>
              <IconButton
                variant="outlined"
                size="small"
                onClick={() => generateLocalPDF(params.row)}
              >
                <PictureAsPdfIcon sx={{ color: "red" }} />
              </IconButton>
              {isOwner && (
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    const fullStudent = students.find(
                      (s) => s.id === params.row.id,
                    );
                    setSelectCandidat(fullStudent);
                    setOpenEditModel(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
            </>
          );
        },
      },
    ];
    return [...allColumns, ...completedClomuns];
  }, [students]);
  const rows = students.map((student) => {
    const row = {
      id: student.id,
      fullname: student.fullname,
      birthdate: student.birthdate,
      moyenne: student.moyenne,
      rang: student.rang,
      passage: student.passage,
    };

    student.notes.forEach((note) => {
      row[note.key] = note.value;
    });

    return row;
  });

  if (!students) return null;

  return (
    <Box>
      <Box
        style={{
          height: 500,
          width: "100%",
          backgroundColor: "background.default",
        }}
      >
        {examen && (
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontSize: { xs: 8, md: 14 } }}>
              examen : {examen.grade} - {examen.start_date} au {examen.end_date}
            </Typography>
            {/* <IconButton
              size="small"
              color="success"
              onClick={downloadNote(examen.id)}
            >
              <DownloadIcon />{" "}
            </IconButton> */}
          </Box>
        )}

        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
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
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "blue !important",
            },
          }}
        />
      </Box>

      <Box>
        {selectCandidat && (
          <EditNote
            open={openEditModel}
            handleClose={handleCloseModal}
            student={selectCandidat}
            setStudents={setStudents}
            examenId={examenId}
            getNotes={getNotes}
          />
        )}
      </Box>
    </Box>
  );
}

export default Note;
