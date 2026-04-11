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
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import { useParams } from "react-router-dom";
import ConfigSkeleton from "./ConfigSkeleton";

function AttendanceTable({ courseId }) {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { activeClubId } = UseAuth();

  // Récupérer les données

  const getStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await Instance(`/api/students?club_id=${activeClubId}`);
      console.log(response);
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
    } finally {
      setIsLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    getStudents();
  }, [getStudents]);
  const { sessionId } = useParams();
  console.log(sessionId);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, sessionsRes] = await Promise.all([
          Instance.get(`/api/courses/${courseId}/students`),
          Instance.get(`/api/courses/${courseId}/sessions`),
        ]);
        setStudents(studentsRes.data.students);
        setSessions(sessionsRes.data.sessions);

        // Initialiser les présences existantes
        const initialAttendance = {};
        studentsRes.data.students.forEach((student) => {
          initialAttendance[student.id] = {};
        });
        sessionsRes.data.sessions.forEach((session) => {
          studentsRes.data.students.forEach((student) => {
            const existing = session.attendances?.find(
              (a) => a.student_id === student.id,
            );
            initialAttendance[student.id][session.id] =
              existing?.status || "absent";
          });
        });
        setAttendance(initialAttendance);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const toggleAttendance = (studentId, sessionId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [sessionId]:
          prev[studentId][sessionId] === "present" ? "absent" : "present",
      },
    }));
  };

  const handleSave = async () => {
    const payload = [];
    Object.keys(attendance).forEach((studentId) => {
      Object.keys(attendance[studentId]).forEach((sessionId) => {
        payload.push({
          student_id: studentId,
          session_id: sessionId,
          status: attendance[studentId][sessionId],
        });
      });
    });

    try {
      await Instance.post("/api/attendances/bulk", payload);
      alert("Présences enregistrées !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  if (isLoading) return <ConfigSkeleton />;

  return (
    <Paper sx={{ p: 3, mt: 3, overflowX: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Gestion des présences
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Élève</TableCell>
            <TableCell>Date de Naissance</TableCell>
            {sessions.map((session) => (
              <TableCell key={session.id}>{session.session_date}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.fullname}</TableCell>
              <TableCell>
                {student.birthdate
                  ? new Date(student.birthdate).toLocaleDateString()
                  : "-"}
              </TableCell>
              {sessions.map((session) => (
                <TableCell key={session.id} sx={{ textAlign: "center" }}>
                  <Checkbox
                    checked={attendance[student.id]?.[session.id] === "present"}
                    onChange={() => toggleAttendance(student.id, session.id)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="contained"
        color="success"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Enregistrer toutes les présences
      </Button>
    </Paper>
  );
}

export default AttendanceTable;
