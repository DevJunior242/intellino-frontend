import { Box, Typography, Avatar, Chip } from "@mui/material";
import { SchoolOutlined } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";

function getInitials(fullname) {
  if (!fullname) return "?";
  const parts = fullname.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : fullname.slice(0, 2).toUpperCase();
}

function getAge(birthdate) {
  if (!birthdate) return null;
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function avatarColors(sex) {
  return sex === "F"
    ? { bgcolor: "#FCE4EC", color: "#880E4F" }
    : { bgcolor: "#E3F2FD", color: "#0D47A1" };
}

function StudentCard({ student }) {
  const { fullname, birthdate, sex, status, photo } = student;
  const age = getAge(birthdate);
  const colors = avatarColors(sex);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <Avatar
        src={photo ?? undefined}
        sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, ...colors }}
      >
        {!photo && getInitials(fullname)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "text.primary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fullname}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {sex === "F" ? "Fille" : "Garçon"}
          {age !== null && <> · {age} ans</>}
        </Typography>
      </Box>

      <Chip
        label={status === "actif" ? "Actif" : status}
        size="small"
        sx={{
          height: 20,
          fontSize: 10,
          fontWeight: 600,
          flexShrink: 0,
          bgcolor: status === "actif" ? "#E8F5E9" : "#F5F5F5",
          color: status === "actif" ? "#2E7D32" : "text.secondary",
        }}
      />
    </Box>
  );
}

/**
 * Props:
 *  - students : res.data.latestStudents
 *  - loading  : bool
 */
function LatestStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { activeClubId } = UseAuth();
  const getLatestStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await Instance.get(
        `/api/students/latest?club_id=${activeClubId}`,
      );
      console.log("Latest students response:", res);
      if (res.status === 200) {
        setStudents(res.data || []);
      }
    } catch (error) {
      console.error("Erreur latest students:", error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    if (activeClubId) {
      getLatestStudents();
    }
  }, [activeClubId, getLatestStudents]);
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          minWidth: 300,
        }}
      >
        <SchoolOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}
        >
          Nouveaux élèves
        </Typography>
        {!loading && (
          <Box
            sx={{
              ml: "auto",
              px: 1,
              py: 0.25,
              borderRadius: 10,
              bgcolor: "#E8F5E9",
              color: "#2E7D32",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {students.length}
          </Box>
        )}
      </Box>

      {loading && <ConfigSkeleton />}

      {!loading && students.length === 0 && (
        <Typography
          sx={{
            fontSize: 12,
            color: "text.disabled",
            textAlign: "center",
            py: 2,
          }}
        >
          Aucun nouvel élève
        </Typography>
      )}

      {!loading && students.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {students.map((s) => (
            <StudentCard key={s.id} student={s} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default LatestStudents;
