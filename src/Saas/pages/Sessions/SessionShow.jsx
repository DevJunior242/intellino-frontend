import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Button,
  Paper,
  Typography,
  Box,
  Pagination,
} from "@mui/material";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import { useLocation, useParams } from "react-router-dom";
import ErrorGlobal from "../../../component/ErrorGlobal";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "../Message";
function SessionShow() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [students, setStudents] = useState([]);
  const [session, setSession] = useState({});
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({});
  const { activeId } = UseAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const clubId = queryParams.get("club_id");

  const { sessionId } = useParams();

  const fetchData = useCallback(
    async (page = 1) => {
      if (!activeId) return;
      setLoading(true);
      setError({});

      try {
        const [studentsRes, sessionsRes] = await Promise.all([
          Instance.get(
            `/api/session/${sessionId}/students?club_id=${activeId}&page=${page}`,
          ),
          Instance.get(`/api/sessions/${sessionId}/show?club_id=${activeId}`),
        ]);

        const rawData = studentsRes?.data?.students;

        const ArrayStudents = Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData)
            ? rawData
            : [];

        setStudents(ArrayStudents);
        setPagination({
          currentPage: rawData.current_page,
          lastPage: rawData.last_page,
          perPage: rawData.per_page,
          total: rawData.total,
        });
        const sessions = sessionsRes?.data?.session || {};

        setSession(sessions);

        const initialAttendance = {};
        ArrayStudents.forEach((student) => {
          initialAttendance[student.id] = {
            [sessions.id]:
              sessions.attendances?.find((a) => a.student_id === student.id)
                ?.status || "absent",
          };
        });

        setAttendance(initialAttendance);
      } catch (err) {
        console.error(err);
        setError({ message: "Erreur lors de la récupération des données." });
      } finally {
        setLoading(false);
      }
    },
    [sessionId, clubId, activeId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleAttendance = (studentId, sessionId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [sessionId]:
          prev[studentId]?.[sessionId] === "present" ? "absent" : "present",
      },
    }));
  };
  const handleSave = async (e) => {
    if (!activeId) return;
    e.preventDefault();
    setIsSubmitting(true);
    setError({});
    try {
      const data = students.map((student) => ({
        student_id: student.id,
        session_id: sessionId,
        status: attendance[student.id]?.[sessionId] || "absent",
      }));

      const payload = {
        attendances: data,
      };
      const response = await Instance.post(
        `/api/attendances/bulk?club_id=${activeId}`,
        payload,
      );
      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      console.error(err);
      ErrorGlobal({ error: err, setError });
      setError({ message: "Erreur lors de l'enregistrement des présences." });
    } finally {
      setIsSubmitting(false);
    }
  };
  const countPresent = students.filter(
    (s) => attendance[s.id]?.[session.id] === "present",
  ).length;

  return (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        overflowX: "auto",
        backgroundColor: "background.default",
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 2, fontSize: { xs: 14, md: 24 }, fontWeight: "bold" }}
      >
        Gestion des présences
      </Typography>
      <Typography
        variant="h1"
        sx={{ mb: 2, fontSize: { xs: 12, md: 16 }, fontWeight: "bold" }}
      >
        veuillez cocher les élèves présents pour la session du{" "}
        {session.session_date}
      </Typography>

      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}
      {/* les messages ereeurs */}
      <form onSubmit={handleSave}>
        <Table sx={{ backgroundColor: "background.default" }}>
          <TableHead>
            <TableRow>
              <TableCell>Élève</TableCell>
              <TableCell>Date de Naissance</TableCell>
              <TableCell>Présent(e) ({session.session_date})</TableCell>{" "}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableCell>
                <PulseLoader />
              </TableCell>
            ) : students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.fullname}</TableCell>
                  <TableCell>
                    {student.birthdate
                      ? new Date(student.birthdate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Checkbox
                      checked={
                        attendance[student.id]?.[session.id] === "present"
                      }
                      onChange={() => toggleAttendance(student.id, session.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableCell>vide</TableCell>
            )}
          </TableBody>
        </Table>
        <Button type="submit" disabled={isSubmitting} variant="contained">
          {isSubmitting
            ? "Enregistrement..."
            : countPresent > 0
              ? `Enregistrer (${countPresent} présents)`
              : "Enregistrer (tous absents)"}
        </Button>
      </form>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => fetchData(value)}
            color="primary"
          />
        )}
      </Box>
    </Paper>
  );
}

export default SessionShow;
