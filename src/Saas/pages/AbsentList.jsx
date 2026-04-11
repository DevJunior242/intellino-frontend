import { Box, Typography, Avatar, Chip, Tooltip } from "@mui/material";
import { PersonOff, EventBusy } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";

function formatTime(timeStr) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5);
}

function getInitials(fullname) {
  if (!fullname) return "?";
  const parts = fullname.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : fullname.slice(0, 2).toUpperCase();
}

function AbsentCard({ attendance }) {
  const { student, session } = attendance;
  const isCancelled = session?.status === "cancelled";

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
        sx={{
          width: 34,
          height: 34,
          fontSize: 12,
          fontWeight: 700,
          bgcolor: "#FBE9E7",
          color: "#BF360C",
        }}
      >
        {getInitials(student?.fullname)}
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
          {student?.fullname ?? "—"}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            color: "text.secondary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {session?.title ?? "—"}
          {session?.start_time && (
            <>
              {" "}
              · {formatTime(session.start_time)}–{formatTime(session.end_time)}
            </>
          )}
        </Typography>
      </Box>

      {isCancelled && (
        <Tooltip title={session?.cancel_reason ?? "Session annulée"}>
          <Chip
            icon={<EventBusy sx={{ fontSize: 12 }} />}
            label="Annulée"
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 600,
              bgcolor: "#FFF3E0",
              color: "#E65100",
              flexShrink: 0,
              "& .MuiChip-icon": { color: "#E65100" },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}

/**
 * Props:
 *  - attendances : res.data  → tableau des derniers absents (avec student + session)
 *  - loading     : bool
 */
function AbsentList() {
  const [attendances, setAttendances] = useState([]);
  const { activeClubId } = UseAuth();
  const [loading, setLoading] = useState(true);

  const getAttendances = useCallback(async () => {
    try {
      setLoading(true);
      const res = await Instance.get(
        `/api/attendances/students?club_id=${activeClubId}`,
      );
      console.log("Attendance response:", res);
      if (res.status === 200) {
        setAttendances(res.data || []);
      }
    } catch (error) {
      console.error("Erreur attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    if (activeClubId) {
      getAttendances();
    }
  }, [activeClubId, getAttendances]);
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          minWidth: 500,
        }}
      >
        <PersonOff sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}
        >
          Derniers absents
        </Typography>
        {!loading && (
          <Box
            sx={{
              ml: "auto",
              px: 1,
              py: 0.25,
              borderRadius: 10,
              bgcolor: "#FBE9E7",
              color: "#BF360C",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {attendances.length}
          </Box>
        )}
      </Box>

      {loading && <ConfigSkeleton />}

      {!loading && attendances.length === 0 && (
        <Typography
          sx={{
            fontSize: 12,
            color: "text.disabled",
            textAlign: "center",
            py: 2,
          }}
        >
          Aucun absent récent
        </Typography>
      )}

      {!loading && attendances.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {attendances.map((a) => (
            <AbsentCard key={a.id} attendance={a} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default AbsentList;
