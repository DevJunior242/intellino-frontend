import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Skeleton,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CalendarToday,
  DateRange,
  FitnessCenter,
  EmojiEvents,
  People,
  EditOutlined,
  CancelOutlined,
  PersonAddOutlined,
} from "@mui/icons-material";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(datetimeStr) {
  if (!datetimeStr) return "--:--";
  const d = new Date(datetimeStr.replace(" ", "T"));
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(datetimeStr) {
  if (!datetimeStr) return "";
  const d = new Date(datetimeStr.replace(" ", "T"));
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupByDate(items) {
  return items.reduce((acc, item) => {
    const day = item.datetime?.split(" ")[0] ?? "unknown";
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
}

// ─── config par rôle ──────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  admin: {
    showStats: true,
    showInstructor: true,
    actions: ["edit", "cancel"],
  },
  instructeur: {
    showStats: false,
    showInstructor: false,
    actions: ["participants"],
  },
  secretaire: {
    showStats: true,
    showInstructor: true,
    actions: ["enroll"],
  },
};

const GRADE_COLORS = {
  "centure blanche": { color: "#f5f5f5" },
  "centure jaune": { color: "#FFEB3B" },
  "centure verte": { color: "#4CAF50" },
  "centure bleue": { color: "#2196F3" },
  "centure noire": { color: "#212121" },
  "centure rouge": { color: "#f44336" },
  "centure grise": { color: "#8884d8" },
  "centure orange": { color: "#ff9800" },
  "centure marron": { color: "#f44336" },
};
// ─── sous-composants ──────────────────────────────────────────────────────────

function StatsRow({ programmes }) {
  const cours = programmes.filter((p) => p.type === "cours").length;
  const examens = programmes.filter((p) => p.type === "examen").length;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 1.5,
        mb: 2,
      }}
    >
      {[
        { label: "Cours", value: cours, color: "#1565C0", bg: "#E3F2FD" },
        { label: "Examens", value: examens, color: "#BF360C", bg: "#FBE9E7" },
      ].map(({ label, value, color, bg }) => (
        <Box
          key={label}
          sx={{
            bgcolor: bg,
            borderRadius: 2,
            px: 2,
            py: 1.25,
          }}
        >
          <Typography sx={{ fontSize: 11, color, fontWeight: 600, mb: 0.25 }}>
            {label.toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ProgramCard({ item }) {
  // const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.admin;
  const isCours = item.type === "cours";
  const gradeColor = GRADE_COLORS[item.grade] ?? GRADE_COLORS["centure jaune"];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        backgroundColor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        px: 2,
        py: 1.5,
        transition: "box-shadow 0.15s",
        "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
        maxWidth: "100%",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Badge type */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: isCours ? "#E3F2FD" : "#FBE9E7",
          color: isCours ? "#1565C0" : "#BF360C",
        }}
      >
        {isCours ? (
          <FitnessCenter sx={{ fontSize: 18 }} />
        ) : (
          <EmojiEvents sx={{ fontSize: 18 }} />
        )}
      </Box>

      {/* Contenu */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
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
            {item.title}
          </Typography>
          <Chip
            label={isCours ? "Cours" : "Examen"}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 600,
              bgcolor: isCours ? "#E3F2FD" : "#FBE9E7",
              color: isCours ? "#1565C0" : "#BF360C",
              border: "none",
            }}
          />
        </Box>

        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {formatTime(item.datetime)} – {formatTime(item.end_datetime)}
        </Typography>

        {/* {config.showInstructor && item.instructor && (
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>
            {item.instructor}
          </Typography>
        )} */}
      </Box>

      {/* Actions */}
      {/* <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
        {config.actions.includes("edit") && (
          <Tooltip title="Modifier">
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <EditOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {config.actions.includes("cancel") && (
          <Tooltip title="Annuler">
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <CancelOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {config.actions.includes("participants") && (
          <Tooltip title="Voir participants">
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <People sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {config.actions.includes("enroll") && (
          <Tooltip title="Inscrire un membre">
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <PersonAddOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box> */}
      {/* grade */}
      {item.grade && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Chip
            label={item.grade}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 600,
              bgcolor: item.grade ? gradeColor : null,
              color: item.grade ? item.gradeColor : "#000",
              border: "none",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

function ProgramSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            gap: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            px: 2,
            py: 1.5,
          }}
        >
          <Skeleton variant="rounded" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={18} sx={{ mb: 0.5 }} />
            <Skeleton width="35%" height={14} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── composant principal ──────────────────────────────────────────────────────

/**
 * Props:
 *  - activeClubId : string | number
 *  - role         : "admin" | "instructeur" | "secretaire"
 */
function Program({ activeClubId, role = "admin" }) {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("today");

  // const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.admin;

  const getProgrammes = useCallback(
    async (r = "today") => {
      try {
        setLoading(true);
        const res = await Instance.get(
          `/api/programmes?club_id=${activeClubId}&range=${r}`,
        );
        console.log("Programme response:", res);
        if (res.status === 200) {
          setProgrammes(res.data?.data ?? []);
        }
      } catch (error) {
        console.error("Erreur programme:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeClubId],
  );

  useEffect(() => {
    if (activeClubId) {
      getProgrammes(range);
    }
  }, [activeClubId, getProgrammes, range]);

  const handleRangeChange = (_, newRange) => {
    if (!newRange) return;
    setRange(newRange);
  };

  const grouped = groupByDate(programmes);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          backgroundColor: "background.default",
          borderRadius: 4,
        }}
      >
        <Typography
          sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}
        >
          Programme
        </Typography>

        <ToggleButtonGroup
          value={range}
          exclusive
          onChange={handleRangeChange}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              fontSize: 11,
              px: 1.5,
              py: 0.5,
              textTransform: "none",
              border: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <ToggleButton value="today">
            <CalendarToday sx={{ fontSize: 13, mr: 0.5 }} />
            Aujourd'hui
          </ToggleButton>
          <ToggleButton value="week">
            <DateRange sx={{ fontSize: 13, mr: 0.5 }} />7 jours
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <StatsRow programmes={programmes} />

      {/* Liste */}
      {loading ? (
        <ConfigSkeleton />
      ) : programmes.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "text.disabled",
          }}
        >
          <CalendarToday sx={{ fontSize: 32, mb: 1, opacity: 0.4 }} />
          <Typography sx={{ fontSize: 13 }}>
            Aucune session pour cette période
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: "100%", pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              width: "100%",
            }}
          >
            {Object.entries(grouped).map(([day, items], idx) => (
              <Box key={day}>
                {/* Séparateur de date (mode semaine) */}
                {range === "week" && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      my: 1.5,
                      overflow: "hidden",
                    }}
                  >
                    {idx > 0 && <Divider sx={{ flex: 1 }} />}
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDateLabel(items[0].datetime)}
                    </Typography>
                    <Divider sx={{ flex: 1 }} />
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {items.map((item) => (
                    <ProgramCard key={item.id} item={item} role={role} />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Program;
