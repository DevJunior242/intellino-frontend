import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import ClubExamModal from "./ClubExamModal";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";

export default function ClubExamsTable() {
  const [openExamId, setOpenExamId] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { activeClubId } = UseAuth();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Instance.get(`/api/club-exams?club_id=${activeClubId}`);
      console.log("RES", res);
      setExams(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    if (!activeClubId) return;

    fetchExams();
  }, [fetchExams, activeClubId]);

  return (
    <>
      {exams.map((exam) => (
        <div key={exam.id} style={{ marginBottom: 16 }}>
          <div>
            {exam.grade} - {exam.start_date}
            <Button
              variant="contained"
              onClick={() => setOpenExamId(exam.id)}
              sx={{ ml: 2 }}
            >
              Ajouter mes students
            </Button>
          </div>

          {openExamId === exam.id && (
            <ClubExamModal
              open={true}
              handleClose={() => setOpenExamId(null)}
              examId={exam.id}
              clubId={activeClubId}
            />
          )}
        </div>
      ))}
    </>
  );
}
