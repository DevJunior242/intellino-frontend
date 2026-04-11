import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";

const MotionPaper = motion(Paper);

export default function LeagueExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = UseAuth();

  const leagueId = auth?.user?.current_league_id;
  console.log("LEAGUE ID", leagueId);
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Instance.get(
        `/api/examen-leagues/examen-leagues?league_id=${leagueId}`,
      );
      console.log("RES", res);
      setExams(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (!leagueId) return;

    fetchExams();
  }, [fetchExams, leagueId]);

  return (
    <TableContainer
      component={MotionPaper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Examen</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Participants</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : exams.length > 0 ? (
            exams.map((exam) => (
              <TableRow key={exam.id} whileHover={{ scale: 1.02 }}>
                <TableCell>{exam.grade}</TableCell>
                <TableCell>{exam.grade}</TableCell>
                <TableCell>{exam.start_date}</TableCell>
                <TableCell>{exam.students_count}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => alert("Voir participants")}
                  >
                    Voir Participants
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Aucun examen
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
